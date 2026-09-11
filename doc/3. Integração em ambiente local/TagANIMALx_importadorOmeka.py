import pandas as pd
import requests

# ==========================================
# CONFIGURAÇÕES DA API
# ==========================================
API_BASE = "http://localhost/omeka_s/api"
KEY_IDENTITY = "b2P5wvtL8VEuo1mrv087GeGEE5Z5AxSg"
KEY_CREDENTIAL = "AbdeQzUbHziTmMBQfzpQVmF1ZVTOCzos"
TEMPLATE_ID = 2
ITEM_SET_ID = 1

# Definimos a variável auth logo aqui no topo para estar disponível para todo o script
auth = {'key_identity': KEY_IDENTITY, 'key_credential': KEY_CREDENTIAL}

try:
    df = pd.read_csv('registos_taganimalx.csv', sep=';', encoding='utf-8')
    df = df.fillna('')
except Exception as e:
    print(f"Erro ao ler o ficheiro CSV: {e}")
    exit()

# ==========================================
# 1. MAPEAMENTO INTELIGENTE DE PROPRIEDADES
# ==========================================
print("1. A ligar ao Omeka S para descobrir os IDs das propriedades...")
try:
    # A variável auth é usada aqui para nos dar permissões de leitura
    res = requests.get(f"{API_BASE}/properties", params={**auth, 'per_page': 1000})
    res.raise_for_status()
    prop_ids = {p.get("o:term"): p.get("o:id") for p in res.json() if "o:term" in p}
    print(f"✅ Sucesso! {len(prop_ids)} propriedades mapeadas na sua base de dados.\n")
except Exception as e:
    print(f"❌ Erro ao ligar ao servidor para ler propriedades: {e}")
    exit()

# ==========================================
# 2. INJEÇÃO DOS DADOS
# ==========================================
print("2. A importar os itens com os metadados completos...\n")

for index, row in df.iterrows():
    payload = {
        "@type": "o:Item",
        "o:resource_template": {"o:id": TEMPLATE_ID},
        "o:item_set": [{"o:id": ITEM_SET_ID}]
    }

    def add_prop(key, value):
        if value and key in prop_ids:
            if key not in payload:
                payload[key] = []
            payload[key].append({
                "type": "literal",
                "property_id": prop_ids[key],
                "@value": str(value).strip()
            })

    # Título principal (Fallback para a Designação se o Nome Comum não existir)
    nome_comum = row.get("Nome comum")
    designacao = row.get("Designação da representação")
    add_prop("dcterms:title", nome_comum if nome_comum else designacao)

    # Restantes campos mapeados exatamente como estão no CSV
    add_prop("dcterms:dateSubmitted", row.get("Data da recolha"))
    add_prop("dcterms:creator", row.get("Recolhido por"))
    add_prop("dwc:scientificName", row.get("Nome científico"))
    add_prop("dwc:taxonRank", row.get("Categoria taxonómica"))
    add_prop("dwc:organismScope", row.get("Indivíduo/Grupo"))
    add_prop("dcterms:type", row.get("Tipologia"))
    add_prop("dcterms:relation", designacao)
    add_prop("dcterms:format", row.get("Técnica"))
    add_prop("dcterms:coverage", row.get("Proveniência"))
    add_prop("dcterms:spatial", row.get("Local"))
    add_prop("dcterms:identifier", row.get("Nº de inventário"))
    add_prop("dcterms:date", row.get("Data"))
    add_prop("dcterms:dateAvailable", row.get("Precisão da data"))
    add_prop("dcterms:provenance", row.get("Autor"))
    add_prop("dcterms:description", row.get("Descrição"))
    add_prop("dcterms:bibliographicCitation", row.get("Referência"))
    add_prop("foaf:depiction", row.get("Multimédia"))
    add_prop("oa:annotates", row.get("Observações"))
    add_prop("dcterms:references", row.get("Hiperligação"))

    # Tratamento especial para as colunas com múltiplos valores (separados por |)
    for m in str(row.get("Material", "")).split("|"):
        if m.strip():
            add_prop("dcterms:medium", m)

    link_iiif = str(row.get("Link multimédia")).strip()
    if link_iiif:  # Se a célula do Excel não estiver vazia
        payload["o:media"] = [
            {
                "o:ingester": "iiif",
                "o:source": link_iiif
            }
        ]

# Envio Final para a API
    try:
        r = requests.post(f"{API_BASE}/items", params=auth, json=payload)
        if r.status_code in [200, 201]:
            item_id = r.json().get("o:id")
            print(f"✅ Item inserido COM SUCESSO! Link: http://localhost/omeka_s/admin/item/{item_id}")
        else:
            print(f"❌ Erro na linha {index+1}: {r.status_code}")
            # Esta linha vai mostrar a mensagem de erro exata do Omeka S!
            print(f"🔎 Detalhe do Omeka S: {r.text}\n") 
    except Exception as e:
        print(f"⚠️ Erro de execução no envio: {e}")