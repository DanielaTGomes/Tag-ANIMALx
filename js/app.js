import {
	carregarItemAleatorio,
	prepararDadosDoItem
} from './api.js';

let itemAtivo = null;
let visualizadorIIIF = null;

/**
 * Inicializa o visualizador IIIF dentro do elemento dedicado.
 *
 * @param {Object} dadosItem - Dados tratados pelo módulo da API
 */
function inicializarVisualizadorIIIF(dadosItem) {
	const elementoVisualizador = document.getElementById('projetor-iiif');

	if (!elementoVisualizador || !dadosItem.codigoMedia) {
		console.warn('Não foi possível inicializar o visualizador IIIF.');
		return;
	}

	if (visualizadorIIIF) {
		visualizadorIIIF.destroy();
		visualizadorIIIF = null;
	}

	elementoVisualizador.dataset.iiifManifest = dadosItem.urlInfoJson;
	elementoVisualizador.dataset.apiItemId = String(dadosItem.itemId);
	elementoVisualizador.dataset.apiMetadata = dadosItem.metadata;

	if (typeof window.OpenSeadragon !== 'function') {
		console.error('OpenSeadragon não está disponível na página.');
		return;
	}

	visualizadorIIIF = window.OpenSeadragon({
		id: 'projetor-iiif',
		prefixUrl: 'https://cdn.jsdelivr.net/npm/openseadragon@4.1/build/openseadragon/images/',
		tileSources: dadosItem.urlInfoJson,
		showNavigationControl: false
	});
}

/**
 * Injeta a legenda preparada pelo módulo da API.
 *
 * @param {string} legenda - Texto da legenda
 */
function injetarLegenda(legenda) {
	const elementoLegenda = document.querySelector('.animalx-imagem-legenda');

	if (elementoLegenda) {
		elementoLegenda.textContent = legenda;
	}
}

/**
 * Renderiza o item atual no visualizador e na legenda.
 *
 * @param {Object} item - Item retornado pela API
 */
function renderizarItem(item) {
	if (!item) {
		return;
	}

	itemAtivo = item;
	const dadosItem = prepararDadosDoItem(item);

	inicializarVisualizadorIIIF(dadosItem);
	injetarLegenda(dadosItem.legenda);
}

document.addEventListener('DOMContentLoaded', async () => {
	const botaoInicio = document.querySelector('.animalx-btn-home');

	if (!botaoInicio) {
		return;
	}

	botaoInicio.addEventListener('click', async (evento) => {
		evento.preventDefault();

		const item = await carregarItemAleatorio();
		renderizarItem(item);
	});
});

export {
	inicializarVisualizadorIIIF,
	injetarLegenda,
	renderizarItem
};
