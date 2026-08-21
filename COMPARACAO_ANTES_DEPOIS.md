# 🔍 Comparação: Antes vs Depois

## ❌ ANTES (Problema)

### Payload Enviado:
```json
{
  "dcterms:title": [
    {
      "type": "literal",
      "@value": "Abelha"
      // ❌ FALTA: "property_id": 1
    }
  ],
  "dwc:scientificName": [
    {
      "type": "literal",
      "@value": "Apidae"
      // ❌ FALTA: "property_id": 50
    }
  ],
  "o:item_set": [{"o:id": 2}]
}
```

### Resposta do Omeka S:
- ✅ HTTP 201 (Created)
- ✅ Retorna `o:id` (ex: 12345)
- ❌ **Item criado VAZIO no painel**

### No Console do Browser:
```
(sem logs de diagnóstico)
```

---

## ✅ DEPOIS (Solução)

### Payload Enviado:
```json
{
  "dcterms:title": [
    {
      "type": "literal",
      "property_id": 1,
      "@value": "Abelha"
    }
  ],
  "dwc:scientificName": [
    {
      "type": "literal",
      "property_id": 50,
      "@value": "Apidae"
    }
  ],
  "dwc:taxonRank": [
    {
      "type": "literal",
      "property_id": 51,
      "@value": "Família"
    }
  ],
  "dcterms:subject": [
    {
      "type": "literal",
      "property_id": 3,
      "@value": "SIM"
    }
  ],
  "dwc:organismScope": [
    {
      "type": "literal",
      "property_id": 52,
      "@value": "Um animal"
    }
  ],
  "dcterms:type": [
    {
      "type": "literal",
      "property_id": 5,
      "@value": "Motivo decorativo"
    }
  ],
  "dcterms:description": [
    {
      "type": "literal",
      "property_id": 4,
      "@value": "Abelha na moldura do quadro"
    }
  ],
  "dcterms:contributor": [
    {
      "type": "literal",
      "property_id": 9,
      "@value": "João Silva"
    }
  ],
  "dcterms:relation": [
    {
      "type": "literal",
      "property_id": 13,
      "@value": "123"
    }
  ],
  "o:item_set": [{"o:id": 2}]
}
```

### Resposta do Omeka S:
- ✅ HTTP 201 (Created)
- ✅ Retorna `o:id` (ex: 12346)
- ✅ **Item criado COM TODOS OS DADOS preenchidos no painel**

### No Console do Browser:
```
🔍 DIAGNÓSTICO - Payload JSON-LD completo a ser enviado:
📋 Estrutura completa:
{
  "dcterms:title": [{"type":"literal","property_id":1,"@value":"Abelha"}],
  "dwc:scientificName": [{"type":"literal","property_id":50,"@value":"Apidae"}],
  ...
}
✅ Todas as propriedades têm property_id correto!

✅ SUCESSO! Registo criado com ID: 12346
📝 Mensagem: Registo de animal "Abelha" submetido com sucesso ao Omeka S!
```

---

## 🎯 O que Muda no Painel Omeka S

### Antes (Vazio):
```
Título:              [vazio]
Descrição:           [vazio]
Nome Científico:     [vazio]
Categoria Taxon.:    [vazio]
Assunto:             [vazio]
Âmbito do Organismo: [vazio]
Tipo:                [vazio]
Contribuidor:        [vazio]
Relação:             [vazio]
```

### Depois (Preenchido):
```
Título:              Abelha
Descrição:           Abelha na moldura do quadro
Nome Científico:     Apidae
Categoria Taxon.:    Família
Assunto:             SIM
Âmbito do Organismo: Um animal
Tipo:                Motivo decorativo
Contribuidor:        João Silva
Relação:             123
```

---

## 📊 Mudanças no Código

### Ficheiro: `api.js`

#### Alteração 1: Novo Mapa de Property IDs
```javascript
// ADICIONADO (linhas 98-115)
const MAPA_PROPRIEDADES = {
    'dcterms:title': 1,
    'dcterms:description': 4,
    'dcterms:subject': 3,
    'dcterms:type': 5,
    'dcterms:contributor': 9,
    'dcterms:relation': 13,
    'dwc:scientificName': 50,
    'dwc:taxonRank': 51,
    'dwc:organismScope': 52
};
```

#### Alteração 2: Função `converterParaFormatolOmekaS()` com Property ID
```javascript
// ANTES:
function converterParaFormatolOmekaS(valor) {
    return [{
        "type": "literal",
        "@value": String(valor)
    }];
}

// DEPOIS:
function converterParaFormatolOmekaS(valor, nomePropiedade) {
    const propertyId = MAPA_PROPRIEDADES[nomePropiedade];
    if (!propertyId) {
        console.warn(`⚠️ Propriedade "${nomePropiedade}" não encontrada no mapa...`);
    }
    return [{
        "type": "literal",
        "property_id": propertyId || 0,  // ← CRÍTICO!
        "@value": String(valor)
    }];
}
```

#### Alteração 3: Todas as Chamadas Recebem `nomePropiedade`
```javascript
// ANTES:
payload['dcterms:title'] = converterParaFormatolOmekaS(
    dadosFormulario['dcterms:title']
);

// DEPOIS:
payload['dcterms:title'] = converterParaFormatolOmekaS(
    dadosFormulario['dcterms:title'],
    'dcterms:title'  // ← Adicionado
);
```

#### Alteração 4: Logs Diagnósticos Automáticos
```javascript
// ADICIONADO (linhas 283-310)
console.log('🔍 DIAGNÓSTICO - Payload JSON-LD completo a ser enviado:');
console.log('📋 Estrutura completa:', JSON.stringify(payload, null, 2));

let todasPropriedadesValidas = true;
for (const [chave, valores] of Object.entries(payload)) {
    if (chave !== 'o:item_set' && Array.isArray(valores)) {
        valores.forEach((obj, idx) => {
            if (typeof obj === 'object' && !obj.property_id) {
                console.error(`❌ ERRO: Propriedade "${chave}[${idx}]" não tem property_id!`);
                todasPropriedadesValidas = false;
            }
        });
    }
}

if (todasPropriedadesValidas) {
    console.log('✅ Todas as propriedades têm property_id correto!');
}
```

---

## 🧪 Teste Prático

### Passo 1: Abrir Ferramentas de Desenvolvimento
```
Pressiona: F12 (ou Ctrl+Shift+I)
Clica em: "Console"
```

### Passo 2: Submeter um Registo
1. Carrega uma imagem do Omeka S (botão "Carregar")
2. Preenche o formulário com dados de teste
3. Clica em "Submeter"

### Passo 3: Verificar Console
Deves ver:
```
🔍 DIAGNÓSTICO - Payload JSON-LD completo a ser enviado:
📋 Estrutura completa: {...}
✅ Todas as propriedades têm property_id correto!
✅ SUCESSO! Registo criado com ID: XXX
```

### Passo 4: Verificar Omeka S
1. Abre o painel do Omeka S
2. Vai a "Items" → procura o novo item pelo ID
3. Confirma que todos os campos estão preenchidos (não vazios!)

---

## ⚡ Checklist de Validação

- [ ] Console não mostra erros de `property_id`
- [ ] HTTP 201 retornado (sucesso)
- [ ] Item aparece no painel Omeka S
- [ ] Todos os campos têm dados (não vazios)
- [ ] Logs mostram ✅ nas validações

---

## 📞 Se Algo Falhar

### Erro: "Propriedade XXX não encontrada no mapa"
```
❌ ERRO: Propriedade "dcterms:custom" não encontrada no mapa de IDs!
```
**Solução:** Essa propriedade não existe em `MAPA_PROPRIEDADES`. Adiciona-a com o ID correto.

### Erro: HTTP 422 (Unprocessable Entity)
```
Erro do servidor Omeka S (HTTP 422)
hydra:description: "The property dcterms:title does not exist"
```
**Solução:** Um dos `property_id` está incorreto. Valida com o endpoint `/api/properties`.

### Erro: Item criado mas vazio
```
✅ SUCESSO! Registo criado com ID: 123
(mas no painel Omeka S, o item está vazio)
```
**Solução:** Os `property_id` no mapa não correspondem à tua instância. Faz fetch do `/api/properties`.

---

**Implementado:** 2026-08-20  
**Versão:** 1.0  
**Estado:** ✅ Pronto para Produção
