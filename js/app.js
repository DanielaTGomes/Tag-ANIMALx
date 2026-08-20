import {
    carregarItemAleatorio,
    obterValorMetadado
} from './api.js';

let itemAtivo = null;
let visualizadorIIIF = null;

const URL_BASE_IIIF = 'https://DanielaTGomes.github.io/imagens_omeka/resultado';
const PREFIXO_OPEN_SEADRAGON = 'https://cdn.jsdelivr.net/npm/openseadragon@4.1/build/openseadragon/images/';

function extrairCodigoMedia(item) {
    const codigoOriginal = obterValorMetadado(item, 'dcterms:identifier')
        || obterValorMetadado(item, 'o:source')
        || obterValorMetadado(item, 'o:title');
    return String(codigoOriginal).replaceAll('.', '_');
}

function inicializarImagemIIIF(item) {
    const elementoVisualizador = document.getElementById('projetor-iiif');
    const codigoMedia = extrairCodigoMedia(item);

    if (!elementoVisualizador || !codigoMedia) return;

    if (visualizadorIIIF) {
        visualizadorIIIF.destroy();
        visualizadorIIIF = null;
    }

    elementoVisualizador.replaceChildren();

    const urlInfoJson = `${URL_BASE_IIIF}/${codigoMedia}/info.json`;
    elementoVisualizador.dataset.iiifManifest = urlInfoJson;
    elementoVisualizador.dataset.apiItemId = String(item?.['o:id'] ?? item?.id ?? '');
    elementoVisualizador.dataset.apiMetadata = JSON.stringify(item);

    if (typeof window.OpenSeadragon !== 'function') return;

    try {
        visualizadorIIIF = window.OpenSeadragon({
            id: 'projetor-iiif',
            prefixUrl: PREFIXO_OPEN_SEADRAGON,
            tileSources: urlInfoJson,
            showNavigationControl: false
        });
    } catch (erro) {
        console.error(`Erro no OpenSeadragon:`, erro);
        visualizadorIIIF = null;
    }
}

function injetarLegendaDinamica(item) {
    const elementoLegenda = document.getElementById('legenda-dinamica');
    if (!elementoLegenda) return;

    const titulo = obterValorMetadado(item, 'dcterms:relation')
        || obterValorMetadado(item, 'dcterms:title')
        || obterValorMetadado(item, 'o:title')
        || 'Título não disponível';
    const dataRegisto = obterValorMetadado(item, 'dcterms:date') || 'S/D';
    const autoria = obterValorMetadado(item, 'dcterms:provenance') || 'Autoria desconhecida';
    const nInventario = obterValorMetadado(item, 'dcterms:identifier') || 'S/N';

    elementoLegenda.innerHTML = `<strong>${titulo}</strong> (${dataRegisto}) de ${autoria}. Museu de Lisboa (${nInventario}).`;
}

async function carregarEApresentarItem() {
    const elementoLegenda = document.getElementById('legenda-dinamica');
    
    if (elementoLegenda) elementoLegenda.innerHTML = "<em>A carregar dados do Omeka S...</em>";

    const item = await carregarItemAleatorio();

    // Se a API devolveu um erro em vez de um item, mostra-o no ecrã!
    if (item && item.erroCritico) {
        if (elementoLegenda) elementoLegenda.innerHTML = `<span style='color:red;'><b>DIAGNÓSTICO:</b> ${item.erroCritico}</span>`;
        return;
    }

    if (!item) return;

    itemAtivo = item;
    inicializarImagemIIIF(item);
    injetarLegendaDinamica(item);
}

// O TRUQUE: Tornamos a função global para que o index.html a consiga chamar!
window.carregarItemANIMALx = carregarEApresentarItem;
