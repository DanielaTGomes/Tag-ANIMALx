// =========================================
// 1. FERRAMENTAS AUXILIARES 
// // =========================================

// =========================================
// MAPEAMENTO DE PROPERTY_IDs DO OMEKA S
// =========================================
// Este mapa associa os nomes das propriedades aos seus IDs numéricos no Omeka S.
// IMPORTANTE: Confirma que estes IDs correspondem à tua instalação do Omeka S!
// Para obter os IDs corretos, faz um pedido GET a: /api/properties?key_identity=...&key_credential=...
const MAPA_PROPRIEDADES = {
    'dcterms:title': 1, 'dcterms:subject': 3, 'dcterms:description': 4,
    'dcterms:contributor': 6, 'dcterms:type': 8, 'dcterms:isReferencedBy': 35,
    'dcterms:audience': 16, 'dwc:scientificName': 419, 'dwc:taxonRank': 439,
    'dwc:organismScope': 372, 'dcterms:relation': 13, 'dcterms:format': 9,
    'dcterms:medium': 26, 'dcterms:coverage': 14, 'dcterms:spatial': 40,
    'dcterms:identifier': 10, 'dcterms:date': 7, 'dcterms:available': 22,
    'dcterms:provenance': 51, 'dcterms:bibliographicCitation': 48,
    'bibo:uri': 121, 'bibo:annotates': 57, 'dcterms:creator': 2, 'dcterms:created': 20
};

function converterParaFormatolOmekaS(valor, nomePropiedade) {
    const propertyId = MAPA_PROPRIEDADES[nomePropiedade];
    return [{
        "type": "literal",
        "property_id": propertyId || 0,
        "@value": String(valor)
    }];
}

function extrairMetadadosOriginais(itemOriginal) {
    const metadadosExtraidos = {};
    const termos = [
        'dcterms:relation', 'dcterms:format', 'dcterms:medium', 'dcterms:coverage', 
        'dcterms:spatial', 'dcterms:identifier', 'dcterms:date', 'dcterms:available', 
        'dcterms:provenance', 'dcterms:bibliographicCitation', 'bibo:uri', 
        'bibo:annotates', 'dcterms:creator', 'dcterms:created'
    ];
    termos.forEach(termo => {
        if (itemOriginal && itemOriginal[termo]) {
            metadadosExtraidos[termo] = itemOriginal[termo][0]['@value'];
        }
    });
    return metadadosExtraidos;
}

// =========================================
// 2. FUNÇÃO PRINCIPAL SERVERLESS
// =========================================
exports.handler = async function(event, context) {
    if (event.httpMethod !== "POST") return { statusCode: 405, body: "Método não permitido" };

    try {
        const { dadosFormulario, itemOriginal } = JSON.parse(event.body);
        if (!dadosFormulario || !itemOriginal) throw new Error('Dados em falta');

        // Lê as chaves do cofre da Netlify
        const baseUrl = process.env.API_URL.replace(/\/+$/, '');
        const auth = `key_identity=${process.env.KEY_IDENTITY}&key_credential=${process.env.KEY_CREDENTIAL}`;
        
        const idModeloRecursos = 2;
        const colecaoIdIntermedia = 141;

        delete dadosFormulario['animalx_colecao_destino'];

        const pacoteAnotacao = { data: new Date().toISOString(), respostas: dadosFormulario };
        const novaAnotacaoFormatada = converterParaFormatolOmekaS(JSON.stringify(pacoteAnotacao), 'bibo:annotates')[0];

        // PASSO 1: VERIFICAR CÓPIA EXISTENTE
        const urlBusca = `${baseUrl}/items?item_set_id=${colecaoIdIntermedia}&property[0][property]=35&property[0][type]=eq&property[0][text]=${itemOriginal['o:id']}&${auth}`;
        const respostaBusca = await fetch(urlBusca);
        const itensEncontrados = await respostaBusca.json();

        if (itensEncontrados && itensEncontrados.length > 0) {
            // CASO A: PATCH (Atualizar cópia existente)
            const copiaExistente = itensEncontrados[0];
            const copiaId = copiaExistente['o:id'];
            
            const payloadPatch = { '@context': `${baseUrl}/api-context`, '@type': 'o:Item' };
            if (copiaExistente['o:item_set']) payloadPatch['o:item_set'] = copiaExistente['o:item_set'];
            if (copiaExistente['o:resource_template']) payloadPatch['o:resource_template'] = copiaExistente['o:resource_template'];

            for (const chave in copiaExistente) {
                if (!chave.startsWith('@') && !chave.startsWith('o:')) payloadPatch[chave] = copiaExistente[chave];
            }

            let historicoAtual = payloadPatch['bibo:annotates'] || [];
            historicoAtual.push(novaAnotacaoFormatada);
            payloadPatch['bibo:annotates'] = historicoAtual;

            const respostaPatch = await fetch(`${baseUrl}/items/${copiaId}?${auth}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payloadPatch)
            });

            if (!respostaPatch.ok) throw new Error(`Falha PATCH: ${await respostaPatch.text()}`);
            return { statusCode: 200, body: JSON.stringify({ sucesso: true, itemId: copiaId }) };

        } else {
            // CASO B: POST (Criar nova cópia)
            const payload = {
                '@context': `${baseUrl}/api-context`,
                '@type': 'o:Item',
                'o:is_public': false,
                'o:item_set': [ { "o:id": colecaoIdIntermedia } ],
                'o:resource_template': { 'o:id': idModeloRecursos }
            };

            const metadadosOriginais = extrairMetadadosOriginais(itemOriginal);
            for (const [termo, valor] of Object.entries(metadadosOriginais)) {
                if (valor && valor !== "") payload[termo] = converterParaFormatolOmekaS(valor, termo);
            }

            payload['bibo:annotates'] = [ novaAnotacaoFormatada ];
            if (itemOriginal['o:id']) {
                payload['dcterms:isReferencedBy'] = converterParaFormatolOmekaS(itemOriginal['o:id'], 'dcterms:isReferencedBy');
            }

            const respostaItem = await fetch(`${baseUrl}/items?${auth}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!respostaItem.ok) throw new Error(`Falha POST Item: ${await respostaItem.text()}`);
            
            const novoItem = await respostaItem.json();
            const novoItemId = novoItem['o:id'];

            // Clonar Multimédia
            if (itemOriginal['o:media'] && itemOriginal['o:media'].length > 0) {
                try {
                    const urlMediaOriginal = itemOriginal['o:media'][0]['@id'];
                    const respostaMediaOriginal = await fetch(`${urlMediaOriginal}?${auth}`);
                    if (respostaMediaOriginal.ok) {
                        const dadosMediaOriginal = await respostaMediaOriginal.json();
                        const urlOrigem = dadosMediaOriginal['o:source'] || dadosMediaOriginal['o:original_url'];
                        if (urlOrigem) {
                            await fetch(`${baseUrl}/media?${auth}`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    "o:ingester": dadosMediaOriginal['o:ingester'],
                                    "file_index": 0,
                                    "o:item": { "o:id": novoItemId },
                                    "ingest_url": urlOrigem,
                                    "o:source": urlOrigem
                                })
                            });
                        }
                    }
                } catch (e) { console.error("Falha a clonar media", e); }
            }

            return { statusCode: 200, body: JSON.stringify({ sucesso: true, itemId: novoItemId }) };
        }

    } catch (erro) {
        return { statusCode: 500, body: JSON.stringify({ sucesso: false, erro: erro.message }) };
    }
};