

/**
 * Constrói o URL autenticado da coleção de itens do Omeka S.
 *
 * @returns {string} URL da API
 */

/**
 * Carrega um item aleatório da coleção configurada.
 * Esta função não conhece nem manipula o DOM.
 *
 * @returns {Promise<Object|null>} Item carregado ou null em caso de erro
 */
async function carregarItemAleatorio() {
    try {
        // Pedido seguro à Netlify Functions (sem chaves!)
        const resposta = await fetch('/.netlify/functions/obter-item');
        
        if (!resposta.ok) return { erroCritico: `Falha no servidor intermédio (HTTP ${resposta.status}).` };

        const items = await resposta.json();
        
        if (!Array.isArray(items) || items.length === 0) {
            return { erroCritico: `A coleção está vazia ou não foi encontrada.` };
        }

        return items[Math.floor(Math.random() * items.length)];
        
    } catch (erro) {
        return { erroCritico: `Falha de rede (${erro.message}).` };
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




/**
 * Converte um valor simples para o formato JSON-LD do Omeka S.
 * O Omeka S exige que as propriedades sejam arrays de objetos com type, @value E property_id.
 *
 * @param {string|number} valor - O valor a converter
 * @param {string} nomePropiedade - Nome da propriedade (ex: 'dcterms:title')
 * @returns {Array<Object>} Array com objeto no formato JSON-LD completo
 * @private
 */


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
        const resposta = await fetch('/.netlify/functions/criar-rascunho', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dadosFormulario, itemOriginal })
        });

        const resultado = await resposta.json();
        
        if (!resposta.ok || !resultado.sucesso) {
            throw new Error(resultado.erro || "Falha no servidor intermédio.");
        }

        return resultado;

    } catch (erro) {
        console.error('Erro de rede:', erro);
        return { sucesso: false, erro: erro.message };
    }
}


// =========================================
// ATUALIZAÇÃO DO ITEM ORIGINAL (PATCH)
// =========================================
async function atualizarItemOriginal(itemOriginal, novaContagem, idColecaoDestino, dadosSubmissao) {
    try {
        console.log(`🔄 A pedir à nuvem para atualizar o Item Original ${itemOriginal['o:id']}...`);
        
        const resposta = await fetch('/.netlify/functions/atualizar-original', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ itemOriginal, novaContagem, idColecaoDestino, dadosSubmissao })
        });

        const resultado = await resposta.json();
        if (resultado.sucesso) {
            console.log(`✅ Item Original ${itemOriginal['o:id']} atualizado com sucesso!`);
            return true;
        } else {
            throw new Error("O servidor intermédio rejeitou a atualização.");
        }
    } catch (erro) {
        console.error('❌ Erro ao atualizar o item original:', erro);
        return false;
    }
}

export {
    carregarItemAleatorio,
    obterValorMetadado,
    prepararDadosDoItem,
    submeterRegistoAnimal,
    atualizarItemOriginal
};
