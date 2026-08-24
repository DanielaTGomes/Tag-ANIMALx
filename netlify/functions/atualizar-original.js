exports.handler = async function(event, context) {
    if (event.httpMethod !== "POST") return { statusCode: 405, body: "Método não permitido" };

    try {
        const { itemOriginal, novaContagem, idColecaoDestino, dadosSubmissao } = JSON.parse(event.body);
        const baseUrlApi = process.env.API_URL.replace(/\/$/, '');
        const auth = `key_identity=${process.env.KEY_IDENTITY}&key_credential=${process.env.KEY_CREDENTIAL}`;

        let historicoAtual = itemOriginal['bibo:annotates'] || [];
        historicoAtual.push({
            "type": "literal",
            "property_id": 57,
            "@value": JSON.stringify({ data: new Date().toISOString(), respostas: dadosSubmissao })
        });

        const payloadPatch = {
            "@context": `${baseUrlApi}/api-context`,
            "@type": "o:Item",
            "o:item_set": [ { "o:id": idColecaoDestino } ], 
            "dcterms:audience": [ { "type": "literal", "property_id": 16, "@value": String(novaContagem) } ], 
            "bibo:annotates": historicoAtual
        };

        const resposta = await fetch(`${baseUrlApi}/items/${itemOriginal['o:id']}?${auth}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payloadPatch)
        });

        if (!resposta.ok) throw new Error(`Falha no PATCH`);
        return { statusCode: 200, body: JSON.stringify({ sucesso: true }) };

    } catch (erro) {
        console.error("Erro na atualização:", erro);
        return { statusCode: 500, body: JSON.stringify({ sucesso: false }) };
    }
};