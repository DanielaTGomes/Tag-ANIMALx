import {
    carregarItemAleatorio,
    submeterRegistoAnimal,
    obterValorMetadado
} from './api.js';

import {
    obterDadosTaxonomicos
} from './taxonomy.js';

import { GestorGamificacao, animalxConfig } from './gamification.js';

import { CONFIG } from './config.js';


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

// Descobre a qual coleção o item pertence com base no código

function identificarColecaoDoItem(item) {
    if (!item) return null;
    
    // 1. Puxa o código formatado usando a tua função existente
    const codigoFormatado = extrairCodigoMedia(item); 
    if (!codigoFormatado) return null;
    
    // 2. Lê o dicionário de siglas da nossa configuração
    const mapaSiglas = animalxConfig.colecoes;
    
    // 3. Procura qual das siglas existe no código da imagem
    for (const sigla in mapaSiglas) {
        if (codigoFormatado.includes(sigla)) {
            return mapaSiglas[sigla]; // Devolve 'azulejaria', 'ceramica', etc.
        }
    }
    
    return null; // Caso não encontre nenhuma das siglas esperadas
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
    darBoasVindasEstagiario();
}

// O TRUQUE: Tornamos a função global para que o index.html a consiga chamar!
window.carregarItemANIMALx = carregarEApresentarItem;

// ==========================================
// LEITURA GLOBAL DE TOTAIS DAS COLEÇÕES
// ==========================================
window.totaisColecoes = { azulejaria: 0, ceramica: 0, pintura: 0, gravura: 0, escultura: 0, desenho: 0 };

async function calcularTotaisColecoes() {
    // Para não atrasar o jogo, verificamos se já contámos nesta sessão
    const totaisGuardados = sessionStorage.getItem('animalx_totais_colecoes');
    if (totaisGuardados) {
        window.totaisColecoes = JSON.parse(totaisGuardados);
        console.log("📊 Totais de coleções carregados da memória:", window.totaisColecoes);
        return;
    }

    console.log("🔍 A varrer o Conjunto de Itens 1 para contar coleções...");
    
    // Faz o pedido ao Omeka S pelos itens do ID 1
    const url = `${CONFIG.API_URL}/items?item_set_id=1&per_page=2000&key_identity=${CONFIG.KEY_IDENTITY}&key_credential=${CONFIG.KEY_CREDENTIAL}`;
    
    try {
        const resposta = await fetch(url);
        if (resposta.ok) {
            const itens = await resposta.json();
            
            // Conta os itens um a um
            itens.forEach(item => {
                const colecao = identificarColecaoDoItem(item);
                if (colecao && window.totaisColecoes[colecao] !== undefined) {
                    window.totaisColecoes[colecao] += 1;
                }
            });
            
            // Guarda na sessão para ser mais rápido nas próximas aberturas
            sessionStorage.setItem('animalx_totais_colecoes', JSON.stringify(window.totaisColecoes));
            console.log("📊 Contagem global finalizada:", window.totaisColecoes);
        }
    } catch (erro) {
        console.error("❌ Erro ao tentar contar as coleções globais:", erro);
    }
}

// ==========================================
// ACOLHIMENTO: CURADOR ESTAGIÁRIO
// ==========================================
function darBoasVindasEstagiario() {
    const progresso = GestorGamificacao.carregarProgresso();
    const jaDeuBoasVindas = sessionStorage.getItem('animalx_boas_vindas');

    // Só dispara se tiver 0 pontos E se ainda não tiver visto a modal nesta sessão
    if (progresso.pontos === 0 && !jaDeuBoasVindas) {
        const nivelEstagiario = animalxConfig.niveis[0];
        
        // Os textos de acolhimento que definimos para o primeiro nível
        const titulo = "O teu primeiro passo na História!";
        const texto = "Acabaste de entrar no arquivo do Museu de Lisboa como Curador Estagiário. Começa a explorar as coleções e ajuda-nos a desvendar as primeiras representações de animais.";
        
        if (typeof abrirModalNivel === 'function') {
            abrirModalNivel(titulo, texto, nivelEstagiario.imagem);
        }
        
        // Regista na memória curta para não voltar a abrir enquanto o navegador estiver aberto
        sessionStorage.setItem('animalx_boas_vindas', 'sim');
    }
}
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
        const consentimentoMarcado = document.getElementById('consentimento-dados')?.checked;
        let nomeUtilizador = 'Curador Anónimo';

        // Verifica o modo de registo e o consentimento explícito
        if (modoParticipacao === 'registar' && consentimentoMarcado) {
            // 1. Extrai do elemento de input do formulário
            const nomeInputado = document.getElementById('investigador-nome')?.value?.trim();
            
            if (nomeInputado && nomeInputado.length > 0) {
                nomeUtilizador = nomeInputado;
                // 2. Associa e guarda na chave animalx_utilizador
                sessionStorage.setItem('animalx_utilizador', nomeUtilizador);
            } else {
                // Recupera da memória caso o utilizador já tenha preenchido antes
                const nomeStorage = sessionStorage.getItem('animalx_utilizador');
                if (nomeStorage && nomeStorage.length > 0) {
                    nomeUtilizador = nomeStorage;
                }
            }
        } else {
            // Se for anónimo, limpa a chave da memória
            sessionStorage.removeItem('animalx_utilizador');
        }

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
            'dcterms:audience': "1", // Contador de avaliações (inicia a 1)
            'dcterms:contributor': nomeUtilizador
        };

        console.log('📦 Payload mapeado para o Omeka S:', dadosFormulario);

        // ============================================
        // PASSO 6: SUBMISSÃO E FEEDBACK
        // ============================================
        const resultado = await submeterRegistoAnimal(dadosFormulario, itemAtivo);

        if (resultado && resultado.sucesso) {
            const teveAnimal = dadosFormulario['dcterms:subject'] === 'SIM';
            const descricao = dadosFormulario['dcterms:description'] || '';
            const teveDescricao = descricao.trim().length > 0;

            const colecaoItem = identificarColecaoDoItem(itemAtivo);

            const infoJogo = GestorGamificacao.registarSubmissao(teveAnimal, teveDescricao, 0, colecaoItem);
            
            console.log(`🏆 Pontos: +${infoJogo.pontosGanhos} | Coleção: ${colecaoItem}`);

            // SE SUBIU DE NÍVEL, CHAMA O MODAL DO TEU INDEX.HTML
            if (infoJogo.subiuDeNivel) {
                let titulo = `Novo Nível Alcançado!`;
                let texto = `Parabéns! Alcançaste os ${infoJogo.nivelAtual.limite} pontos e és agora um ${infoJogo.nivelAtual.titulo}.`;
                
                if (typeof abrirModalNivel === 'function') {
                    // Chama a tua função com os textos dinâmicos e o respetivo selo
                    abrirModalNivel(titulo, texto, infoJogo.nivelAtual.imagem);
                }
            }
        }
         return resultado;
    } catch (erro) {
        console.error('❌ Erro ao submeter o formulário:', erro);

        return {
            sucesso: false,
            erro: erro.message || 'Erro inesperado ao submeter o formulário.'
        };
    }

   
}

// Torna a função acessível globalmente para o HTML e outras funções
window.submeterFormularioReal = submeterFormularioReal;

// Torna a função acessível globalmente para o HTML e outras funções
window.submeterFormularioReal = submeterFormularioReal;

// =========================================
// ATUALIZAÇÃO DO CADERNO DE CAMPO (COM DIAGNÓSTICO)
// =========================================

window.atualizarCadernoDeCampo = function() {
    // 1. Carrega os dados e o nível atual
    const progresso = GestorGamificacao.carregarProgresso();
    const nivelAtual = GestorGamificacao.obterNivelAtual(progresso.pontos);
    
    // 2. Atualiza Pontos, Animais, Nome e Selo do Nível
    const elPontos = document.querySelector('[data-api-field="totalPontos"]');
    const elAnimais = document.getElementById('animalx-animais-identificados');
    const elNomeNivel = document.getElementById('animalx-nome-nivel');
    const elSeloNivel = document.getElementById('animalx-selo-nivel');

    if (elPontos) elPontos.innerText = progresso.pontos;
    if (elAnimais) elAnimais.innerText = progresso.animaisIdentificados;
    if (elNomeNivel) elNomeNivel.innerText = nivelAtual.titulo;
    if (elSeloNivel) elSeloNivel.src = nivelAtual.imagem;

    // ==========================================
    // 3. CALCULAR O PREENCHIMENTO DA BARRA DE NÍVEL
    // ==========================================
 
    const niveis = animalxConfig.niveis;
    
    let limiteBase = 0;
    let proximoLimite = 100; // Começa por defeito com a meta do Nível 2
    let pontosFaltam = 0;
    let percentagemBarra = 100; // Por defeito 100% (caso seja o nível máximo)

    // Descobre qual é a meta do próximo nível
    for (let i = 0; i < niveis.length; i++) {
        if (progresso.pontos >= niveis[i].limite) {
            limiteBase = niveis[i].limite;
            if (i + 1 < niveis.length) {
                proximoLimite = niveis[i + 1].limite;
            } else {
                proximoLimite = limiteBase; // Atingiu o teto máximo!
            }
        }
    }

    // Calcula a percentagem e quantos pontos faltam
    if (proximoLimite > limiteBase) {
        percentagemBarra = ((progresso.pontos - limiteBase) / (proximoLimite - limiteBase)) * 100;
        pontosFaltam = proximoLimite - progresso.pontos;
    }

    // Aplica o preenchimento na barra visual (ID 'barra-nivel-pontos')
    const barraNivel = document.getElementById('barra-nivel-pontos');
    if (barraNivel) {
        barraNivel.style.width = percentagemBarra + '%';
    }

    console.log(`📊 Nível: ${nivelAtual.titulo} | Faltam ${pontosFaltam}pts para subir | Barra a ${percentagemBarra}%`);

    // ==========================================
    // 4. ATUALIZAR AS BARRAS DE COLEÇÃO
    // ==========================================

    const totaisGlobais = window.totaisColecoes || {};
    const colecoesProgresso = progresso.colecoes || {};

    // Dicionário com TODAS as 6 tipologias!
    const mapeamentoColecoes = {
        'azulejaria': 'Azulejaria',
        'ceramica': 'Ceramica',
        'escultura': 'Escultura',
        'pintura': 'Pintura',
        'gravura': 'Gravura',
        'desenho': 'Desenho'
    };

    for (const [chaveApi, sufixoHtml] of Object.entries(mapeamentoColecoes)) {
        const totalNoServidor = totaisGlobais[chaveApi] || 0;
        const totalVistoPeloUser = colecoesProgresso[chaveApi] || 0;
        
        // 1. Injeta os números
        const elTratados = document.querySelector(`[data-api-field="tratados${sufixoHtml}"]`);
        const elTotal = document.querySelector(`[data-api-field="total${sufixoHtml}"]`);
        
        if (elTratados) elTratados.innerText = totalVistoPeloUser;
        if (elTotal) elTotal.innerText = totalNoServidor;

        // 2. Atualiza a barra
        const elBarraProgresso = document.getElementById(`barra-progresso-${chaveApi}`);
        if (elBarraProgresso) {
            let percentagem = 0;
            if (totalNoServidor > 0) {
                percentagem = (totalVistoPeloUser / totalNoServidor) * 100;
            }
            elBarraProgresso.style.width = `${percentagem}%`;
        }
    }
};

// ==========================================
// INICIALIZAÇÃO GERAL DO JOGO
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // Liga a contagem global mal a página termina de carregar
    if (typeof calcularTotaisColecoes === 'function') {
        calcularTotaisColecoes();
    }
});