# 🔧 Como Descobrir os Property IDs Corretos do Teu Omeka S

## ⚠️ IMPORTANTE

Os `property_id` fornecidos em `api.js` (linhas 98-115) são **exemplos baseados em instalações padrão**. A tua instância pode ter IDs diferentes!

**Se os itens continuarem vazios após a correção, é porque os IDs estão incorretos.**

---

## 📡 Método 1: Usar a REST API do Omeka S (Recomendado)

### Passo 1: Preparar a URL
```
GET {SEU_URL_OMEKA_S}/api/properties?key_identity={SEU_KEY_IDENTITY}&key_credential={SEU_KEY_CREDENTIAL}
```

Substitui:
- `{SEU_URL_OMEKA_S}` → ex: `http://localhost/omeka-s`
- `{SEU_KEY_IDENTITY}` → encontra em Omeka S → Settings → API
- `{SEU_KEY_CREDENTIAL}` → encontra em Omeka S → Settings → API

**Exemplo real:**
```
http://localhost/omeka-s/api/properties?key_identity=abc123&key_credential=xyz789
```

### Passo 2: Testar no Browser
1. Abre uma nova aba
2. Cola a URL na barra de endereço
3. Pressiona Enter
4. Procura pelas propriedades que usas (abaixo está o que procurar)

### Passo 3: Procurar pela Propriedade
Procura no JSON retornado por estas entradas. Encontra `"o:id"` de cada uma:

```json
{
  "o:id": 1,
  "o:term": "dcterms:title",
  "o:label": "Title",
  ...
}
```

**Propriedades a Procurar:**
| Termo | Descrição |
|-------|-----------|
| `dcterms:title` | Título |
| `dcterms:description` | Descrição |
| `dcterms:subject` | Assunto |
| `dcterms:type` | Tipo |
| `dcterms:contributor` | Contribuidor |
| `dcterms:relation` | Relação |
| `dcterms:date` | Data |
| `dwc:scientificName` | Nome Científico |
| `dwc:taxonRank` | Categoria Taxonómica |
| `dwc:organismScope` | Âmbito do Organismo |

---

## 🛠️ Método 2: Usar cURL (Terminal)

### No Windows PowerShell:
```powershell
$url = "http://localhost/omeka-s/api/properties?key_identity=YOUR_KEY&key_credential=YOUR_CRED"
$response = Invoke-WebRequest -Uri $url
$response.Content | ConvertFrom-Json | Format-Table @{Label="ID";Expression={$_."o:id"}}, @{Label="Term";Expression={$_."o:term"}} -AutoSize
```

### No macOS/Linux (bash):
```bash
curl -s "http://localhost/omeka-s/api/properties?key_identity=YOUR_KEY&key_credential=YOUR_CRED" | jq '.[] | {id: ."o:id", term: ."o:term"}'
```

---

## 📝 Método 3: Verificar no Painel Omeka S

### Passo 1: Abre o Painel Admin
```
{SEU_URL}/admin
```

### Passo 2: Vai a Settings → Properties
Omeka S mostra uma lista (mas pode não mostrar os IDs diretamente)

### Passo 3: Procura na Fonte da Página
1. Pressiona `F12`
2. Vai a "Inspector" → "Network"
3. Recarrega a página (`F5`)
4. Procura um pedido GET para `/admin/properties` ou `/api/properties`
5. Clica nesse pedido e vê a Preview
6. Procura pelos IDs

---

## 🔍 Exemplo Real de Resposta

Quando fazes o pedido a `/api/properties`, recebas algo como:

```json
[
  {
    "o:id": 1,
    "o:term": "dcterms:title",
    "o:label": "Title",
    "o:comment": null,
    "o:localName": "title",
    "o:domain": null,
    "o:range": null,
    "@context": "http://www.w3.org/ns/hydra/core"
  },
  {
    "o:id": 3,
    "o:term": "dcterms:subject",
    "o:label": "Subject",
    ...
  },
  {
    "o:id": 4,
    "o:term": "dcterms:description",
    "o:label": "Description",
    ...
  },
  ...
]
```

**Daí extrai os `o:id` de cada `o:term` que precisas.**

---

## ✏️ Como Atualizar o Mapa em `api.js`

Depois de descobrir os IDs corretos, abre `js/api.js` e atualiza:

```javascript
const MAPA_PROPRIEDADES = {
    'dcterms:title': 1,              // ← Usa o ID que encontraste
    'dcterms:description': 4,        // ← Atualiza com o ID real
    'dcterms:subject': 3,            // ← etc...
    'dcterms:type': 5,
    'dcterms:contributor': 9,
    'dcterms:relation': 13,
    'dwc:scientificName': 50,
    'dwc:taxonRank': 51,
    'dwc:organismScope': 52
};
```

Se a tua instância não tiver uma propriedade (ex: `dwc:scientificName`), remove-a do mapa ou adiciona com o ID correto.

---

## 🤖 Automático: Script para Gerar o Mapa

Se preferires, cria um script que faz fetch automático e gera o mapa:

### Adicionar a `api.js`:

```javascript
/**
 * Busca dinamicamente o mapa de propriedades do Omeka S.
 * Executa uma vez no carregamento e cache o resultado.
 */
let MAPA_PROPRIEDADES_DINAMICO = null;

async function obterMapaPropriedadesDinamico() {
    if (MAPA_PROPRIEDADES_DINAMICO) {
        return MAPA_PROPRIEDADES_DINAMICO;
    }

    try {
        const url = `${CONFIG.API_URL}/properties?key_identity=${CONFIG.KEY_IDENTITY}&key_credential=${CONFIG.KEY_CREDENTIAL}`;
        const resposta = await fetch(url);
        
        if (!resposta.ok) {
            console.warn('Não consegui buscar o mapa dinâmico, usando mapa estático.');
            return MAPA_PROPRIEDADES;
        }

        const propriedades = await resposta.json();
        MAPA_PROPRIEDADES_DINAMICO = {};

        propriedades.forEach(prop => {
            MAPA_PROPRIEDADES_DINAMICO[prop['o:term']] = prop['o:id'];
        });

        console.log('✅ Mapa de propriedades carregado dinamicamente:', MAPA_PROPRIEDADES_DINAMICO);
        return MAPA_PROPRIEDADES_DINAMICO;

    } catch (erro) {
        console.error('Erro ao buscar mapa dinâmico:', erro);
        return MAPA_PROPRIEDADES;
    }
}

// Depois, na função converterParaFormatolOmekaS:
async function converterParaFormatolOmekaS(valor, nomePropiedade) {
    const mapa = await obterMapaPropriedadesDinamico();
    const propertyId = mapa[nomePropiedade];
    
    if (!propertyId) {
        console.warn(`⚠️ Propriedade "${nomePropiedade}" não encontrada.`);
    }
    
    return [{
        "type": "literal",
        "property_id": propertyId || 0,
        "@value": String(valor)
    }];
}
```

**⚠️ Nota:** Esta abordagem é mais robusta mas um pouco mais lenta (faz um fetch extra na primeira submissão).

---

## ✅ Checklist de Validação

Depois de atualizar o mapa:

- [ ] Abriste o endpoint `/api/properties` com as credenciais corretas
- [ ] Copiaste os `o:id` corretos para cada propriedade
- [ ] Atualizaste `MAPA_PROPRIEDADES` em `api.js`
- [ ] Testaste uma submissão nova
- [ ] No console, vês ✅ "Todas as propriedades têm property_id correto!"
- [ ] No painel Omeka S, o item aparece preenchido (não vazio)

---

## 🆘 Se Ainda Não Funcionar

### Debug Step 1: Confirma o URL do Omeka S
```javascript
// No console do browser:
console.log(CONFIG.API_URL);  // Deve ser a URL base do teu Omeka S
```

### Debug Step 2: Testa o Fetch Manualmente
```javascript
// No console do browser:
fetch('http://localhost/omeka-s/api/properties?key_identity=YOUR_KEY&key_credential=YOUR_CRED')
    .then(r => r.json())
    .then(data => console.log(data));
```

### Debug Step 3: Verifica Erros CORS
Se vires um erro CORS, pode ser que a API não permita pedidos do domínio atual. Nesse caso, contacta o admin do Omeka S.

### Debug Step 4: Valida o Payload Antes de Enviar
```javascript
// Antes de fazer o fetch do POST, imprime o payload:
console.log('Payload a enviar:', JSON.stringify(payload, null, 2));
```

Verifica se cada propriedade tem `property_id` não-zero.

---

**Última atualização:** 2026-08-20  
**Status:** ✅ Guia Completo
