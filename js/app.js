import {
    carregarItemAleatorio,
    submeterRegistoAnimal,
    obterValorMetadado
} from './api.js';

import {
    obterDadosTaxonomicos
} from './taxonomy.js';

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
/**
 * Submete o formulário preenchido pelo utilizador para a REST API do Omeka S.
 * 
 * Esta função recolhe todos os dados da interface, valida as entradas,
 * mapeia para os metadados Darwin Core/Dublin Core e envia para o Omeka S
 * através da função submeterRegistoAnimal.
 * 
 * Fluxo:
 * 1. Verifica o modo de participação (registar ou anónimo)
 * 2. Recolhe o nome do utilizador se aplicável
 * 3. Valida que existe um item ativo para anotar
 * 4. Extrai todos os valores do formulário (P1-P5)
 * 5. Obtém dados taxonómicos do animal selecionado
 * 6. Constrói o objeto de dados e submete via API
 * 7. Trata erros e exibe feedback
 * 
 * @returns {Promise<Object>} Resultado da submissão com sucesso ou erro
 * @throws {Error} Pode lancar erros críticos de rede
 * 
 * @example
 * // Chamada do HTML ou JS
 * await submeterFormularioReal();
 */
async function submeterFormularioReal() {
    try {
        console.log('🚀 Iniciando submissão do formulário...');

        // ============================================
        // PASSO 1: RECOLHA DO NOME DO UTILIZADOR
        // ============================================
        const modoParticipacao = document.querySelector('input[name="modo_participacao"]:checked')?.value;
        let nomeUtilizador = 'Curador Anónimo';

        // Se o modo for "registar", tenta obter o nome real
        if (modoParticipacao === 'registar') {
            const nomeInputado = document.getElementById('investigador-nome')?.value?.trim();
            
            if (nomeInputado && nomeInputado.length > 0) {
                nomeUtilizador = nomeInputado;
                // Armazena no sessionStorage para uso posterior
                sessionStorage.setItem('animalx_utilizador', nomeUtilizador);
            } else {
                // Se o campo está vazio mas selecionou "registar", usa sessão ou anonimato
                const nomeStorage = sessionStorage.getItem('animalx_utilizador');
                if (nomeStorage && nomeStorage.length > 0) {
                    nomeUtilizador = nomeStorage;
                } else {
                    console.warn('⚠️ Modo "registar" selecionado, mas sem nome fornecido. Usando "Curador Anónimo".');
                    nomeUtilizador = 'Curador Anónimo';
                }
            }
        }

        console.log(`👤 Utilizador: ${nomeUtilizador} (Modo: ${modoParticipacao})`);

        // ============================================
        // PASSO 2: VALIDAÇÃO DO ITEM ATIVO
        // ============================================
        if (!itemAtivo || !itemAtivo['o:id']) {
            const mensagemErro = 'Nenhum item carregado para anotar. Carrega uma imagem primeiro.';
            console.error(`❌ ${mensagemErro}`);
            return {
                sucesso: false,
                erro: mensagemErro
            };
        }

        const idItemOriginal = itemAtivo['o:id'];
        console.log(`📷 Item a anotar: ${idItemOriginal}`);

        // ============================================
        // PASSO 3: RECOLHA DOS VALORES DO FORMULÁRIO
        // ============================================

        // Pergunta 1: Há animal na imagem? (SIM/NÃO)
        const respostaPergunta1 = document.querySelector('input[name="pergunta-1"]:checked')?.value 
            || document.querySelector('#opcoes-p1 button.selecionado')?.textContent?.trim()
            || '';

        // Pergunta 2: Que animal?
        const nomeComumAnimal = document.getElementById('input-animal')?.value?.trim() || '';

        // Pergunta 3: Quantidade/Âmbito
        const quantidadeAnimal = document.getElementById('input-quantidade')?.value?.trim() || '';

        // Pergunta 4: Função/Contexto do animal
        const funcaoAnimal = document.getElementById('input-funcao')?.value?.trim() || '';

        // Pergunta 5: Notas e observações
        const notasObservacoes = document.getElementById('input-descricao')?.value?.trim() || '';

        console.log('📋 Respostas recolhidas:', {
            pergunta1: respostaPergunta1,
            animal: nomeComumAnimal,
            quantidade: quantidadeAnimal,
            funcao: funcaoAnimal,
            notas: notasObservacoes
        });

        // ============================================
        // PASSO 4: OBTENÇÃO DE DADOS TAXONÓMICOS
        // ============================================
        let nomeCientifico = 'Não identificado';
        let categoriaTaxonomica = 'Não identificada';

        if (nomeComumAnimal && nomeComumAnimal.length > 0) {
            const dadosTaxonomicos = obterDadosTaxonomicos(nomeComumAnimal);
            nomeCientifico = dadosTaxonomicos.cientifico;
            categoriaTaxonomica = dadosTaxonomicos.categoria;
            
            console.log(`🔬 Dados Taxonómicos:`, {
                comum: nomeComumAnimal,
                cientifico: nomeCientifico,
                categoria: categoriaTaxonomica
            });
        }

// ----------------------------------------------------
        // RECOLHA DE DADOS DA INTERFACE (Mapeado pelo index.html)
        // ----------------------------------------------------

        // P1: Há algum animal? (Lê o texto do botão que tem a classe 'selecionado' ou assume 'SIM')
        const p1Resposta = document.querySelector('#opcoes-p1 .selecionado')?.innerText || "SIM";

        // P2: Qual animal? (Verifica se clicou no "Não sei", senão lê o input)
        const isAnimalNaoSei = document.getElementById('check-nao-sei')?.checked;
        const animalSelecionado = isAnimalNaoSei ? "Não sei" : (document.getElementById('input-animal')?.value || "Não identificado");
        
        // Vai ao dicionário taxonómico buscar o Nome Científico e a Categoria
        const infoTaxonomia = obterDadosTaxonomicos(animalSelecionado);

        // P3: Quantidade (Verifica se clicou no "Não sei", senão lê o input)
        const isQuantidadeNaoSei = document.getElementById('check-nao-sei-p3')?.checked;
        const quantidadeSelecionada = isQuantidadeNaoSei ? "Não sei" : (document.getElementById('input-quantidade')?.value || "Não especificado");

        // P4: Função (Verifica se clicou no "Não sei", senão lê o input)
        const isFuncaoNaoSei = document.getElementById('check-nao-sei-p4')?.checked;
        const funcaoSelecionada = isFuncaoNaoSei ? "Não sei" : (document.getElementById('input-funcao')?.value || "Não especificado");

        // P5: Descrição (Verifica se clicou no "Não sei", senão lê a textarea)
        const isDescricaoNaoSei = document.getElementById('check-nao-sei-p5')?.checked;
        const descricaoPreenchida = isDescricaoNaoSei ? "Sem descrição" : (document.getElementById('input-descricao')?.value || "");

        // P6: Outro animal? (Apenas para controlo lógico do sistema, não vai para a BD)
        const p6Resposta = document.querySelector('#opcoes-p6 .selecionado')?.innerText || "NÃO";

        // ----------------------------------------------------
        // CONSTRUÇÃO DO OBJETO PARA O OMEKA S
        // ----------------------------------------------------
        const dadosFormulario = {
            'dcterms:subject': p1Resposta, // Pergunta 1
            'dcterms:title': animalSelecionado, // Pergunta 2 (Nome Comum)
            'dwc:scientificName': infoTaxonomia.cientifico, // Taxonomia
            'dwc:taxonRank': infoTaxonomia.categoria, // Taxonomia
            'dwc:organismScope': quantidadeSelecionada, // Pergunta 3
            'dcterms:type': funcaoSelecionada, // Pergunta 4
            'dcterms:description': descricaoPreenchida, // Pergunta 5
            'dcterms:audience': "1" // Contador de avaliações (inicia a 1)
        };

        console.log('📦 Payload mapeado para o Omeka S:', dadosFormulario);

        // ============================================
        // PASSO 6: SUBMISSÃO E FEEDBACK
        // ============================================
        const resultado = await submeterRegistoAnimal(dadosFormulario, idItemOriginal);

        if (resultado.sucesso) {
            console.log(`✅ SUCESSO! Registo criado com ID: ${resultado.itemId}`);
            console.log(`📝 Mensagem: ${resultado.mensagem}`);
            
            return {
                sucesso: true,
                itemId: resultado.itemId,
                mensagem: resultado.mensagem
            };
        } else {
            console.error(`❌ FALHA na submissão:`, resultado.erro);
            console.error(`Detalhes do servidor:`, resultado.detalhes);
            
            return {
                sucesso: false,
                erro: resultado.erro,
                detalhes: resultado.detalhes
            };
        }

    } catch (erro) {
        // Tratamento de erros críticos não capturados
        console.error('💥 Erro CRÍTICO ao submeter formulário:', erro);
        console.error('Stack trace:', erro.stack);

        return {
            sucesso: false,
            erro: `Erro crítico não previsto: ${erro.message}`,
            detalhes: erro
        };
    }
}

// Torna a função acessível globalmente para o HTML e outras funções
window.submeterFormularioReal = submeterFormularioReal;