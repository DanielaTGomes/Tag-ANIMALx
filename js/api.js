import { CONFIG } from './config.js';

/**
 * Constrói o URL autenticado da coleção de itens do Omeka S.
 *
 * @returns {string} URL da API
 */
function construirUrlItens() {
    return `${CONFIG.API_URL}/items?item_set_id=1&key_identity=${CONFIG.KEY_IDENTITY}&key_credential=${CONFIG.KEY_CREDENTIAL}`;
}

/**
 * Carrega um item aleatório da coleção configurada.
 * Esta função não conhece nem manipula o DOM.
 *
 * @returns {Promise<Object|null>} Item carregado ou null em caso de erro
 */
async function carregarItemAleatorio() {
    try {
        const resposta = await fetch(construirUrlItens());
        
        // 1. Se o Omeka rejeitar a ligação (ex: Chave errada)
        if (!resposta.ok) {
            return { erroCritico: `O Omeka S rejeitou o pedido (Erro HTTP ${resposta.status}). Confirma se as chaves no config.js estão corretas e se o teu utilizador tem permissões.` };
        }

        const items = await resposta.json();
        
        // 2. Se a resposta chegar bem, mas a coleção não tiver itens
        if (!Array.isArray(items) || items.length === 0) {
            return { erroCritico: `O Omeka S respondeu bem, mas a coleção está vazia! Confirma se o 'item_set_id=1' no api.js é o ID correto da coleção "Por Classificar".` };
        }

        // Tudo correu bem! Devolve um item ao calhas
        return items[Math.floor(Math.random() * items.length)];
        
    } catch (erro) {
        // 3. Se o browser bloquear o pedido (ex: erro de CORS ou XAMPP desligado)
        return { erroCritico: `Falha de rede (${erro.message}). Isto acontece geralmente se o XAMPP estiver desligado ou devido a um bloqueio de CORS (estás a usar o Live Server no VS Code?).` };
    }

    
}


/**
 * Obtém o primeiro valor legível de um campo de metadados do Omeka S.
 *
 * @param {Object} item - Item retornado pela API
 * @param {string} propriedade - Nome da propriedade
 * @returns {string} Valor do campo ou string vazia
 */
function obterValorMetadado(item, propriedade) {
    const metadado = item?.[propriedade];
    const valor = Array.isArray(metadado) ? metadado[0] : metadado;

    if (typeof valor === 'string' || typeof valor === 'number') {
        return String(valor);
    }

    if (valor && typeof valor === 'object') {
        return String(valor['@value'] ?? valor.value ?? valor.value_resource_name ?? valor.display_title ?? '');
    }

    return '';
}

/**
 * Prepara os dados que o controlador precisa para renderizar um item.
 * O código da imagem é sempre convertido para string e normalizado.
 *
 * @param {Object} item - Item retornado pela API
 * @returns {Object} Dados tratados para a interface
 */
function prepararDadosDoItem(item) {
    const codigoOriginal = obterValorMetadado(item, 'dcterms:identifier')
        || obterValorMetadado(item, 'o:source')
        || obterValorMetadado(item, 'o:title');
    const codigoMedia = String(codigoOriginal).replaceAll('.', '_');
    const titulo = obterValorMetadado(item, 'dcterms:relation')
        || obterValorMetadado(item, 'dcterms:title')
        || obterValorMetadado(item, 'o:title')
        || obterValorMetadado(item, 'title')
        || 'Título não disponível';
    const dataRegisto = obterValorMetadado(item, 'dcterms:date') || 'Data não disponível';
    const autoria = obterValorMetadado(item, 'dcterms:provenance') || 'Autoria não disponível';
    const nInventario = obterValorMetadado(item, 'dcterms:identifier') || 'Nº de inventário não disponível';

    return {
        item,
        codigoMedia,
        urlInfoJson: `https://DanielaTGomes.github.io/imagens_omeka/resultado/${codigoMedia}/info.json`,
        itemId: item?.['o:id'] ?? item?.id ?? '',
        metadata: JSON.stringify(item),
        legenda: `${titulo} (${dataRegisto}) de ${autoria}, disponível no acervo do Museu de Lisboa (${nInventario}).`
    };
}

// =========================================
// MAPEAMENTO DE PROPERTY_IDs DO OMEKA S
// =========================================
// Este mapa associa os nomes das propriedades aos seus IDs numéricos no Omeka S.
// IMPORTANTE: Confirma que estes IDs correspondem à tua instalação do Omeka S!
// Para obter os IDs corretos, faz um pedido GET a: /api/properties?key_identity=...&key_credential=...
const MAPA_PROPRIEDADES = {
    // Metadados obtidos através do formulário
    'dcterms:title': 1,
    'dcterms:subject': 3,
    'dcterms:description': 4,
    'dcterms:contributor': 6,
    'dcterms:type': 8,
    'dcterms:isReferencedBy':35,
    'dcterms:audience': 16,
    'dwc:scientificName': 419,
    'dwc:taxonRank': 439,
    'dwc:organismScope': 372,
    // Metadados a recuperar do item original
    'dcterms:relation': 13,
    'dcterms:format':9,
    'dcterms:medium':26,
    'dcterms:coverage':14,
    'dcterms:spatial':40,
    'dcterms:identifier':10,
    'dcterms:date':7,
    'dcterms:available':22,
    'dcterms:provenance':51,
    'dcterms:bibliographicCitation':48,
    'bibo:uri':121,
    'bibo:annotates':57,
    'dcterms:creator':2,
    'dcterms:created':20,

};

/**
 * Converte um valor simples para o formato JSON-LD do Omeka S.
 * O Omeka S exige que as propriedades sejam arrays de objetos com type, @value E property_id.
 *
 * @param {string|number} valor - O valor a converter
 * @param {string} nomePropiedade - Nome da propriedade (ex: 'dcterms:title')
 * @returns {Array<Object>} Array com objeto no formato JSON-LD completo
 * @private
 */
function converterParaFormatolOmekaS(valor, nomePropiedade) {
    const propertyId = MAPA_PROPRIEDADES[nomePropiedade];
    
    if (!propertyId) {
        console.warn(`⚠️ Aviso: Propriedade "${nomePropiedade}" não encontrada no mapa de IDs. Verifica o MAPA_PROPRIEDADES.`);
    }
    
    return [
        {
            "type": "literal",
            "property_id": propertyId || 0,  // 0 causará erro no Omeka S, alertando para o problema
            "@value": String(valor)
        }
    ];
}

/**
 * Submete um novo registo de animal para o Omeka S.
 * 
 * Esta função cria um novo "Item" no Omeka S com todos os metadados
 * recolhidos do formulário da aplicação TAG ANIMALx, mapeados para os
 * padrões Dublin Core (dcterms) e Darwin Core (dwc). O item é automaticamente
 * associado ao Item Set com ID 2.
 *
 * @param {Object} dadosFormulario - Objeto com os dados do formulário preenchido
 *        Esperado com as propriedades (caso existam):
 *        - dcterms:title: Nome comum do animal
 *        - dwc:scientificName: Nome científico
 *        - dwc:taxonRank: Categoria taxonómica
 *        - dcterms:subject: Presença de animal (SIM/NÃO)
 *        - dwc:organismScope: Quantidade/âmbito
 *        - dcterms:type: Função/contexto do animal
 *        - dcterms:description: Notas e observações
 *        - dcterms:contributor: Nome do utilizador (opcional, usará "Curador Anónimo" se não fornecido)
 * 
 * @param {string|number} itemOriginalId - ID ou URL do item original que foi anotado
 * 
 * @returns {Promise<Object>} Objeto com resultado da submissão:
 *          - Se sucesso: { sucesso: true, itemId: <ID do novo item>, mensagem: <descrição> }
 *          - Se erro: { sucesso: false, erro: <mensagem de erro>, detalhes: <resposta do servidor> }
 * 
 * @throws {Error} Relança erros críticos da rede ou configuração
 * 
 * @example
 * // Uso básico
 * const dados = {
 *     'dcterms:title': 'Abelha',
 *     'dwc:scientificName': 'Apidae',
 *     'dwc:taxonRank': 'Família',
 *     'dcterms:subject': 'SIM',
 *     'dwc:organismScope': 'Um animal',
 *     'dcterms:type': 'Motivo decorativo',
 *     'dcterms:description': 'Abelha na moldura do quadro'
 * };
 * 
 * const resultado = await submeterRegistoAnimal(dados, 12345);
 * if (resultado.sucesso) {
 *     console.log(`Item criado com ID: ${resultado.itemId}`);
 * }
 */

// =========================================
// EXTRAÇÃO DE METADADOS DO ITEM ORIGINAL
// =========================================
function extrairMetadadosOriginais(itemOriginal) {
    const metadadosExtraidos = {};
    const termosARecuperar = [
        'dcterms:relation', 'dcterms:format', 'dcterms:medium', 
        'dcterms:coverage', 'dcterms:spatial', 'dcterms:identifier', 
        'dcterms:date', 'dcterms:available', 'dcterms:provenance', 
        'dcterms:bibliographicCitation', 'bibo:uri', 'bibo:annotates', 
        'dcterms:creator', 'dcterms:created'
    ];

    termosARecuperar.forEach(termo => {
        if (itemOriginal && itemOriginal[termo]) {
            metadadosExtraidos[termo] = itemOriginal[termo][0]['@value'];
        }
    });

    return metadadosExtraidos;
}

// =========================================
// GERADOR DO LINK IIIF
// =========================================
function gerarUrlIiif(itemOriginal) {
    if (!itemOriginal || !itemOriginal['dcterms:identifier']) return null;
    const numInventario = itemOriginal['dcterms:identifier'][0]['@value'];
    const codigoMedia = numInventario.replaceAll('.', '_');
    return `https://DanielaTGomes.github.io/imagens_omeka/resultado/${codigoMedia}/info.json`;
}

// =========================================
// SUBMISSÃO DUPLA (ITEM + MULTIMÉDIA)
// =========================================
async function submeterRegistoAnimal(dadosFormulario, itemOriginal) {
    try {
        if (!dadosFormulario || typeof dadosFormulario !== 'object') {
            return { sucesso: false, erro: 'Dados do formulário inválidos' };
        }

        const baseUrl = String(CONFIG.API_URL || '').replace(/\/+$/, '');
        
        const idModeloRecursos = 2;
        // Inicializa o Payload - ATENÇÃO: Confirma se o item_set id é 22 ou 2
        const payload = {
            '@context': `${baseUrl}/api-context`,
            '@type': 'o:Item',
            'o:is_public': false,
            'o:item_set': [ { 'o:id': 22 } ],
            'o:resource_template': { 'o:id': idModeloRecursos }
        };

        // 1. Extrair e adicionar os metadados herdados do item original
        const metadadosOriginais = extrairMetadadosOriginais(itemOriginal);
        for (const [termo, valor] of Object.entries(metadadosOriginais)) {
            if (valor && valor !== "") {
                payload[termo] = converterParaFormatolOmekaS(valor, termo);
            }
        }

        // 2. Adicionar as respostas do formulário
        for (const [termo, valor] of Object.entries(dadosFormulario)) {
            if (valor && valor !== "") {
                payload[termo] = converterParaFormatolOmekaS(valor, termo);
            }
        }

        // 3. Adicionar utilizador e relação de anotação
       
        if (itemOriginal && itemOriginal['o:id']) {
            payload['dcterms:isReferencedBy'] = converterParaFormatolOmekaS(itemOriginal['o:id'], 'dcterms:isReferencedBy');
        }

        console.log('📦 Payload JSON-LD pronto para envio:', payload);

        // ==========================================
        // PEDIDO 1: CRIAR O ITEM
        // ==========================================
        const urlItem = `${baseUrl}/items?key_identity=${CONFIG.KEY_IDENTITY}&key_credential=${CONFIG.KEY_CREDENTIAL}`;
        const respostaItem = await fetch(urlItem, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!respostaItem.ok) {
            throw new Error(`Falha ao criar o Item: ${await respostaItem.text()}`);
        }

        const novoItem = await respostaItem.json();
        const novoItemId = novoItem['o:id'];
        console.log(`✅ Sucesso! Item Base criado com ID: ${novoItemId}`);

        // ==========================================
        // PEDIDO 2: CLONAR A MULTIMÉDIA ORIGINAL
        // ==========================================
        if (itemOriginal['o:media'] && itemOriginal['o:media'].length > 0) {
            console.log("🔗 A ler configurações da multimédia original...");
            try {
                const urlMediaOriginal = itemOriginal['o:media'][0]['@id'];
                const respostaMediaOriginal = await fetch(urlMediaOriginal);
                
                if (respostaMediaOriginal.ok) {
                    const dadosMediaOriginal = await respostaMediaOriginal.json();

                    const tipoIngester = dadosMediaOriginal['o:ingester'];
                    const urlOrigem = dadosMediaOriginal['o:source'] || dadosMediaOriginal['o:original_url'];

                    if (urlOrigem) {
                        // Constrói o novo payload com a dupla garantia (ingest_url + o:source)
                        const payloadMedia = {
                            "o:ingester": tipoIngester,
                            "file_index": 0,
                            "o:item": { "o:id": novoItemId },
                            "ingest_url": urlOrigem, // Para ingesters do tipo 'url' nativo
                            "o:source": urlOrigem    // ⬅️ A CORREÇÃO: O módulo 'iiif' exige esta chave!
                        };

                        const urlCriarMedia = `${baseUrl}/media?key_identity=${CONFIG.KEY_IDENTITY}&key_credential=${CONFIG.KEY_CREDENTIAL}`;
                        const respostaMedia = await fetch(urlCriarMedia, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(payloadMedia)
                        });

                        if (!respostaMedia.ok) {
                            console.warn(`⚠️ O Item foi criado, mas falhou ao clonar a media: ${await respostaMedia.text()}`);
                        } else {
                            console.log("🖼️ Multimédia clonada e associada com sucesso!");
                        }
                    }
                }
            } catch (erroMedia) {
                console.error("❌ Erro ao tentar clonar a multimédia:", erroMedia);
            }
        }

        return {
            sucesso: true,
            itemId: novoItemId,
            mensagem: `Registo de animal criado com sucesso no Omeka S.`
        };

    } catch (erro) {
        console.error('Erro crítico ao submeter registo:', erro);

        return {
            sucesso: false,
            erro: `Erro de rede ou configuração: ${erro.message}`,
            detalhes: 'Confirma se o Omeka S está online e as chaves no config.js estão corretas.'
        };
    }
}

export {
    carregarItemAleatorio,
    obterValorMetadado,
    prepararDadosDoItem,
    submeterRegistoAnimal
};