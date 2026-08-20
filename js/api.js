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

export {
    carregarItemAleatorio,
    obterValorMetadado,
    prepararDadosDoItem
};
