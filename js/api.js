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
    'dcterms:title': 1,
    'dcterms:subject': 3,
    'dcterms:description': 4,
    'dcterms:contributor': 6,
    'dcterms:type': 8,
    'dcterms:relation': 13,
    'dcterms:audience': 16,
    'dwc:scientificName': 419,
    'dwc:taxonRank': 439,
    'dwc:organismScope': 372
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
async function submeterRegistoAnimal(dadosFormulario, itemOriginalId) {
    try {
        // Valida entrada básica
        if (!dadosFormulario || typeof dadosFormulario !== 'object') {
            return {
                sucesso: false,
                erro: 'Dados do formulário inválidos',
                detalhes: 'O objeto dadosFormulario deve ser um objeto válido'
            };
        }

        // Constrói a URL de submissão com credenciais
        const urlSubmissao = `${CONFIG.API_URL}/items?key_identity=${CONFIG.KEY_IDENTITY}&key_credential=${CONFIG.KEY_CREDENTIAL}`;

        // Obtém o nome do utilizador do sessionStorage, ou usa valor padrão
        const nomeUtilizador = sessionStorage.getItem('nomeUtilizador') 
            || window.nomeUtilizador 
            || 'Curador Anónimo';

        // ============================================
        // CONSTRUÇÃO DO PAYLOAD EM FORMATO JSON-LD
        // ============================================
        const baseUrl = String(CONFIG.API_URL || '').replace(/\/+$/, '');

        const payload = {
            '@context': `${baseUrl}/api-context`,
            '@type': 'o:Item',
            'o:item_set': [
                {
                    'o:id': 22
                }
            ]
        };

        // Propriedades Dublin Core (dcterms) e Darwin Core (dwc)
        // IMPORTANTE: Cada propriedade é um array de objetos com type, property_id e @value

        if (dadosFormulario['dcterms:title']) {
            payload['dcterms:title'] = converterParaFormatolOmekaS(
                dadosFormulario['dcterms:title'],
                'dcterms:title'
            );
        }

        if (dadosFormulario['dcterms:subject']) {
            payload['dcterms:subject'] = converterParaFormatolOmekaS(
                dadosFormulario['dcterms:subject'],
                'dcterms:subject'
            );
        }

        if (dadosFormulario['dcterms:description']) {
            payload['dcterms:description'] = converterParaFormatolOmekaS(
                dadosFormulario['dcterms:description'],
                'dcterms:description'
            );
        }

        payload['dcterms:contributor'] = converterParaFormatolOmekaS(
            nomeUtilizador,
            'dcterms:contributor'
        );

        if (dadosFormulario['dcterms:type']) {
            payload['dcterms:type'] = converterParaFormatolOmekaS(
                dadosFormulario['dcterms:type'],
                'dcterms:type'
            );
        }

        if (itemOriginalId) {
            payload['dcterms:relation'] = converterParaFormatolOmekaS(
                itemOriginalId,
                'dcterms:relation'
            );
        }

        if (dadosFormulario['dcterms:audience']) {
            payload['dcterms:audience'] = converterParaFormatolOmekaS(
                dadosFormulario['dcterms:audience'],
                'dcterms:audience'
            );
        }

        if (dadosFormulario['dwc:scientificName']) {
            payload['dwc:scientificName'] = converterParaFormatolOmekaS(
                dadosFormulario['dwc:scientificName'],
                'dwc:scientificName'
            );
        }

        if (dadosFormulario['dwc:taxonRank']) {
            payload['dwc:taxonRank'] = converterParaFormatolOmekaS(
                dadosFormulario['dwc:taxonRank'],
                'dwc:taxonRank'
            );
        }

        if (dadosFormulario['dwc:organismScope']) {
            payload['dwc:organismScope'] = converterParaFormatolOmekaS(
                dadosFormulario['dwc:organismScope'],
                'dwc:organismScope'
            );
        }

        // ============================================
        // DIAGNÓSTICO: LOG DO PAYLOAD FINAL
        // ============================================
        console.log('═══════════════════════════════════════════════════════════════════');
        console.log('🔍 DIAGNÓSTICO - Payload JSON-LD final antes do fetch:');
        console.log(JSON.stringify(payload, null, 2));
        console.log('═══════════════════════════════════════════════════════════════════');

        let todasPropriedadesValidas = true;
        for (const [chave, valor] of Object.entries(payload)) {
            if (chave === '@context' || chave === '@type' || chave === 'o:item_set') continue;

            if (Array.isArray(valor)) {
                valor.forEach((obj, idx) => {
                    if (obj && typeof obj === 'object' && obj.property_id === undefined) {
                        console.error(`❌ ERRO: "${chave}" na posição ${idx} não tem property_id.`);
                        todasPropriedadesValidas = false;
                    }
                });
            }
        }

        if (todasPropriedadesValidas) {
            console.log('✅ Todas as propriedades do payload têm property_id correto.');
        } else {
            console.warn('⚠️ Há propriedades sem property_id e o Omeka S vai ignorá-las.');
        }

        // ============================================
        // EXECUÇÃO DO PEDIDO POST
        // ============================================
        const resposta = await fetch(urlSubmissao, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        // ============================================
        // PROCESSAMENTO DA RESPOSTA
        // ============================================
        if (!resposta.ok) {
            const erroServidor = await resposta.json().catch(() => ({}));
            
            console.error('Erro ao submeter registo:', {
                statusCode: resposta.status,
                statusText: resposta.statusText,
                detalhesServidor: erroServidor
            });

            return {
                sucesso: false,
                erro: `Erro do servidor Omeka S (HTTP ${resposta.status})`,
                detalhes: erroServidor?.['hydra:description'] 
                    || erroServidor?.message 
                    || resposta.statusText 
                    || 'Erro desconhecido'
            };
        }

        // Parse da resposta bem-sucedida
        const itemCriado = await resposta.json();
        const idNovoItem = itemCriado?.['o:id'];

        console.log('✅ Registo de animal submetido com sucesso!', {
            itemId: idNovoItem,
            nomeAnimal: dadosFormulario['dcterms:title'],
            nomeCientifico: dadosFormulario['dwc:scientificName'],
            utilizador: nomeUtilizador,
            timestampSubmissao: new Date().toISOString()
        });

        return {
            sucesso: true,
            itemId: idNovoItem,
            mensagem: `Registo de animal "${dadosFormulario['dcterms:title']}" submetido com sucesso ao Omeka S!`
        };

    } catch (erro) {
        // Erro de rede ou outra exceção crítica
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
    prepararDadosDoItem
};
