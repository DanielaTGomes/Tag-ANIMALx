import {
    carregarItemAleatorio,
    obterValorMetadado
} from './api.js';

let itemAtivo = null;
let visualizadorIIIF = null;

const URL_BASE_IIIF = 'https://DanielaTGomes.github.io/imagens_omeka/resultado';
const PREFIXO_OPEN_SEADRAGON = 'https://cdn.jsdelivr.net/npm/openseadragon@4.1/build/openseadragon/images/';

/**
 * Extrai e normaliza o código usado pelo serviço IIIF.
 *
 * @param {Object} item - Item devolvido pela API
 * @returns {string} Código sem pontos
 */
function extrairCodigoMedia(item) {
    const codigoOriginal = obterValorMetadado(item, 'dcterms:identifier')
        || obterValorMetadado(item, 'o:source')
        || obterValorMetadado(item, 'o:title');

    return String(codigoOriginal).replaceAll('.', '_');
}

/**
 * Inicializa OpenSeadragon dentro de #projetor-iiif.
 *
 * @param {Object} item - Item devolvido pela API
 */
function inicializarImagemIIIF(item) {
    const elementoVisualizador = document.getElementById('projetor-iiif');
    const codigoMedia = extrairCodigoMedia(item);

    if (!elementoVisualizador || !codigoMedia) {
        console.warn('Não foi possível encontrar o viewer IIIF ou o código da imagem.');
        return;
    }

    if (visualizadorIIIF) {
        visualizadorIIIF.destroy();
        visualizadorIIIF = null;
    }

    // Garante que restos de uma instância anterior não ficam no elemento.
    elementoVisualizador.replaceChildren();

    const urlInfoJson = `${URL_BASE_IIIF}/${codigoMedia}/info.json`;
    elementoVisualizador.dataset.iiifManifest = urlInfoJson;
    elementoVisualizador.dataset.apiItemId = String(item?.['o:id'] ?? item?.id ?? '');
    elementoVisualizador.dataset.apiMetadata = JSON.stringify(item);

    if (typeof window.OpenSeadragon !== 'function') {
        console.error('OpenSeadragon não está disponível na página.');
        return;
    }

    try {
        visualizadorIIIF = window.OpenSeadragon({
            id: 'projetor-iiif',
            prefixUrl: PREFIXO_OPEN_SEADRAGON,
            tileSources: urlInfoJson,
            showNavigationControl: false
        });

        visualizadorIIIF.addHandler('open-failed', (evento) => {
            console.error(`Falha ao carregar o URL IIIF ${urlInfoJson}:`, evento?.message || evento);
        });

        visualizadorIIIF.addHandler('tile-source-failed', (evento) => {
            console.error(`Falha ao carregar o tile source IIIF ${urlInfoJson}:`, evento?.message || evento);
        });
    } catch (erro) {
        console.error(`Erro ao inicializar o OpenSeadragon com ${urlInfoJson}:`, erro);
        visualizadorIIIF = null;
    }
}

/**
 * Injeta a legenda dinâmica em #legenda-dinamica.
 *
 * @param {Object} item - Item devolvido pela API
 */
function injetarLegendaDinamica(item) {
    const elementoLegenda = document.getElementById('legenda-dinamica');

    if (!elementoLegenda) {
        console.warn('O elemento #legenda-dinamica não foi encontrado.');
        return;
    }

    const titulo = obterValorMetadado(item, 'dcterms:relation')
        || obterValorMetadado(item, 'dcterms:title')
        || obterValorMetadado(item, 'o:title')
        || 'Título não disponível';
    const dataRegisto = obterValorMetadado(item, 'dcterms:date') || 'Data não disponível';
    const autoria = obterValorMetadado(item, 'dcterms:provenance') || 'Autoria não disponível';
    const nInventario = obterValorMetadado(item, 'dcterms:identifier') || 'Nº de inventário não disponível';

    elementoLegenda.textContent = `${titulo} (${dataRegisto}) de ${autoria}, disponível no acervo do Museu de Lisboa (${nInventario}).`;
}

/**
 * Carrega e apresenta um novo item, mantendo-o disponível para a sessão atual.
 */
async function carregarEApresentarItem() {
    const item = await carregarItemAleatorio();

    if (!item) {
        return;
    }

    itemAtivo = item;
    inicializarImagemIIIF(item);
    injetarLegendaDinamica(item);
}

document.addEventListener('DOMContentLoaded', () => {
    carregarEApresentarItem();
});

export {
    carregarEApresentarItem,
    extrairCodigoMedia,
    inicializarImagemIIIF,
    injetarLegendaDinamica
};
