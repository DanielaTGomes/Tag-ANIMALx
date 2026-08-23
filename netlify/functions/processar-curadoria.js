exports.handler = async function(event, context) {
    if (event.httpMethod !== "POST") return { statusCode: 405, body: "Método não permitido" };

    try {
        const { tipo, idCopia, idOriginal, dadosFinais } = JSON.parse(event.body);
        
        const baseUrl = process.env.API_URL.replace(/\/+$/, '');
        const auth = `key_identity=${process.env.KEY_IDENTITY}&key_credential=${process.env.KEY_CREDENTIAL}`;

        // ==========================================
        // AÇÃO 1: EXTRAIR ANIMAL (Criar Registo Final)
        // ==========================================
        if (tipo === 'extrair') {
            // 1. Buscar propriedades para mapear
            const resProps = await fetch(`${baseUrl}/properties?${auth}&per_page=1000`);
            const propriedadesData = await resProps.json();
            const mapaProps = {};
            propriedadesData.forEach(p => mapaProps[p['o:term']] = p['o:id']);

            const formatarSeguro = (valor, termo) => [{
                "type": "literal",
                "property_id": mapaProps[termo] || 0,
                "@value": String(valor)
            }];

            // 2. Buscar item original
            const resOriginal = await fetch(`${baseUrl}/items/${idOriginal}?${auth}`);
            const itemOriginal = await resOriginal.json();

            const payloadNovoItem = {
                '@context': `${baseUrl}/api-context`,
                '@type': 'o:Item',
                'o:item_set': [ { 'o:id': 22 } ],
                'o:resource_template': itemOriginal['o:resource_template']
            };

            for (const chave in itemOriginal) {
                if (!chave.startsWith('@') && !chave.startsWith('o:') && chave !== 'bibo:annotates') {
                    payloadNovoItem[chave] = itemOriginal[chave];
                }
            }

            if (dadosFinais['Animal (Comum)']) payloadNovoItem['dcterms:title'] = formatarSeguro(dadosFinais['Animal (Comum)'], 'dcterms:title');
            if (dadosFinais['Tem animal?']) payloadNovoItem['dcterms:subject'] = formatarSeguro(dadosFinais['Tem animal?'], 'dcterms:subject');
            if (dadosFinais['Nome Científico']) payloadNovoItem['dwc:scientificName'] = formatarSeguro(dadosFinais['Nome Científico'], 'dwc:scientificName');
            if (dadosFinais['Categoria']) payloadNovoItem['dwc:taxonRank'] = formatarSeguro(dadosFinais['Categoria'], 'dwc:taxonRank');
            if (dadosFinais['Quantidade']) payloadNovoItem['dwc:organismScope'] = formatarSeguro(dadosFinais['Quantidade'], 'dwc:organismScope');
            if (dadosFinais['Função']) payloadNovoItem['dcterms:type'] = formatarSeguro(dadosFinais['Função'], 'dcterms:type');
            if (dadosFinais['Descrição']) payloadNovoItem['dcterms:description'] = formatarSeguro(dadosFinais['Descrição'], 'dcterms:description');
            if (dadosFinais['Curador']) payloadNovoItem['dcterms:contributor'] = formatarSeguro(dadosFinais['Curador'], 'dcterms:contributor');

            if (dadosFinais['Nota Curatorial']) {
                payloadNovoItem['bibo:annotates'] = formatarSeguro(dadosFinais['Nota Curatorial'], 'bibo:annotates');
            }

            const resNovoItem = await fetch(`${baseUrl}/items?${auth}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payloadNovoItem)
            });

            if (!resNovoItem.ok) throw new Error("Falha ao criar o item no Omeka S.");
            const novoItemData = await resNovoItem.json();

            // Clonar multimédia
            if (itemOriginal['o:media'] && itemOriginal['o:media'].length > 0) {
                const resMedia = await fetch(`${itemOriginal['o:media'][0]['@id']}?${auth}`);
                if (resMedia.ok) {
                    const dadosMedia = await resMedia.json();
                    const urlOrigem = dadosMedia['o:source'] || dadosMedia['o:original_url'];
                    if (urlOrigem) {
                        await fetch(`${baseUrl}/media?${auth}`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                "o:ingester": dadosMedia['o:ingester'],
                                "file_index": 0,
                                "o:item": { "o:id": novoItemData['o:id'] },
                                "ingest_url": urlOrigem,
                                "o:source": urlOrigem
                            })
                        });
                    }
                }
            }

            return { statusCode: 200, body: JSON.stringify({ sucesso: true, novoId: novoItemData['o:id'] }) };
        }

        // ==========================================
        // AÇÃO 2: CONCLUIR E ARQUIVAR (Remover da fila)
        // ==========================================
        if (tipo === 'concluir') {
            // 1. Tira o Item Original da Coleção Pública
            await fetch(`${baseUrl}/items/${idOriginal}?${auth}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    '@context': `${baseUrl}/api-context`,
                    '@type': 'o:Item',
                    'o:item_set': []
                })
            });

            // 2. Apaga a Cópia Intermédia
            await fetch(`${baseUrl}/items/${idCopia}?${auth}`, { method: 'DELETE' });

            return { statusCode: 200, body: JSON.stringify({ sucesso: true }) };
        }

        return { statusCode: 400, body: JSON.stringify({ sucesso: false, erro: 'Ação inválida' }) };

    } catch (erro) {
        console.error("Erro em processar-curadoria:", erro);
        return { statusCode: 500, body: JSON.stringify({ sucesso: false, erro: erro.message }) };
    }
};