# ✅ SOLUÇÃO: Correção do Omeka S REST API - Property IDs

## 📋 Resumo da Correção

O problema foi que a função `submeterRegistoAnimal()` criava itens no Omeka S com HTTP 201 (sucesso), mas os itens ficavam **completamente vazios** porque a REST API do Omeka S **ignora os campos de metadados** que não contenham explicitamente o atributo `property_id`.

### 🎯 O que foi alterado:

#### 1. **api.js** - Três mudanças críticas:

##### A) Adicionado Mapa de Property IDs (linhas 98-115)
```javascript
const MAPA_PROPRIEDADES = {
    'dcterms:title': 1,                    // Título
    'dcterms:description': 4,              // Descrição
    'dcterms:subject': 3,                  // Assunto
    'dcterms:type': 5,                     // Tipo
    'dcterms:contributor': 9,              // Contribuidor
    'dcterms:relation': 13,                // Relação
    'dwc:scientificName': 50,              // Nome científico (Darwin Core)
    'dwc:taxonRank': 51,                   // Categoria taxonómica (Darwin Core)
    'dwc:organismScope': 52                // Âmbito do organismo (Darwin Core)
};
```

**⚠️ IMPORTANTE:** Estes IDs são exemplos. **Confirma os IDs reais da tua instância Omeka S** executando:
```bash
GET /api/properties?key_identity=YOUR_KEY&key_credential=YOUR_CREDENTIAL
```

##### B) Função `converterParaFormatolOmekaS()` Atualizada (linhas 117-138)
**Antes:**
```javascript
function converterParaFormatolOmekaS(valor) {
    return [{
        "type": "literal",
        "@value": String(valor)
    }];
}
```

**Depois:**
```javascript
function converterParaFormatolOmekaS(valor, nomePropiedade) {
    const propertyId = MAPA_PROPRIEDADES[nomePropiedade];
    
    if (!propertyId) {
        console.warn(`⚠️ Aviso: Propriedade "${nomePropiedade}" não encontrada...`);
    }
    
    return [{
        "type": "literal",
        "property_id": propertyId || 0,  // ← CRÍTICO!
        "@value": String(valor)
    }];
}
```

##### C) Todas as Chamadas Atualizadas (linhas 210-268)
Cada chamada agora passa o `nomePropiedade`:
```javascript
// ANTES:
payload['dcterms:title'] = converterParaFormatolOmekaS(
    dadosFormulario['dcterms:title']
);

// DEPOIS:
payload['dcterms:title'] = converterParaFormatolOmekaS(
    dadosFormulario['dcterms:title'],
    'dcterms:title'  // ← Nome da propriedade
);
```

##### D) Diagnóstico Completo Adicionado (linhas 283-310)
Logs automáticos que mostram:
- 🔍 JSON completo do payload antes de enviar
- ✅ Confirmação que todas as propriedades têm `property_id`
- ❌ Avisos se alguma propriedade estiver sem `property_id`

---

## 🚀 Formato Obrigatório Agora Garantido

Cada propriedade de metadado agora segue **rigorosamente** este formato:

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
  "o:item_set": [
    {
      "o:id": 2
    }
  ]
}
```

---

## 📝 Como Verificar

### 1. Abrir o Browser Console (F12)
Quando submeteres um registo, verás logs assim:

```
🔍 DIAGNÓSTICO - Payload JSON-LD completo a ser enviado:
📋 Estrutura completa:
{
  "dcterms:title": [
    {
      "type": "literal",
      "property_id": 1,
      "@value": "Abelha"
    }
  ],
  ...
}
✅ Todas as propriedades têm property_id correto!
```

### 2. Confirmar no Painel Omeka S
Após a submissão (HTTP 201), o item deve aparecer **preenchido** com todos os dados.

---

## ⚠️ Se os Items Continuarem Vazios

### Cenário 1: Property IDs Incorretos
**Sintoma:** HTTP 201 mas campos ainda vazios  
**Solução:** Verifica se os IDs no `MAPA_PROPRIEDADES` correspondem ao teu Omeka S:

```bash
# Ferramenta: Pedir à API os IDs corretos
GET http://localhost/omeka-s/api/properties?key_identity=YOUR_KEY&key_credential=YOUR_CRED

# Resultado esperado:
[
  {"o:id": 1, "o:term": "dcterms:title", ...},
  {"o:id": 50, "o:term": "dwc:scientificName", ...},
  ...
]
```

Copia os `o:id` corretos e atualiza `MAPA_PROPRIEDADES` em `api.js`.

### Cenário 2: Item Set ID Errado
**Sintoma:** Recusado com HTTP 400/422  
**Solução:** Confirma o ID correto da coleção onde desejas guardar itens. Atualmente é 2 (linha 281 em `api.js`).

---

## 📚 Estrutura do Código Atualizado

```
api.js
├── carregarItemAleatorio()
├── obterValorMetadado()
├── prepararDadosDoItem()
├── MAPA_PROPRIEDADES (novo) ← property_ids mapeados
├── converterParaFormatolOmekaS() (atualizado) ← agora com property_id
└── submeterRegistoAnimal() (atualizado) ← chama com property names
    ├── Valida dados
    ├── Constrói payload com property_ids
    ├── Console logs diagnósticos (novo) ← para debug
    ├── POST /api/items
    └── Processa resposta
```

---

## ✅ Checklist Final

- [x] Mapa de propriedades (`MAPA_PROPRIEDADES`) criado
- [x] Função `converterParaFormatolOmekaS()` atualizada com `property_id`
- [x] Todas as 8 chamadas atualizadas com `nomePropiedade`
- [x] Item Set associado corretamente (ID 2)
- [x] Logs diagnósticos adicionados
- [x] Validação automática de `property_id` no console

---

## 🎓 Próximas Ações (Opcional)

1. **Fazer fetch dinâmico dos property_ids** (em vez de mapa estático):
   ```javascript
   async function obterMapaPropriedades() {
       const url = `${CONFIG.API_URL}/properties?key_identity=...&key_credential=...`;
       const props = await fetch(url).then(r => r.json());
       return props.reduce((map, p) => ({...map, [p['o:term']]: p['o:id']}), {});
   }
   ```

2. **Adicionar propriedades adicionais** quando necessário (ex: `dcterms:date`, `foaf:name`, etc.)

3. **Criar testes automatizados** para validar o payload antes de enviar

---

**Status:** ✅ Pronto para testar!  
**Última atualização:** 2026-08-20
