import {
    carregarItemAleatorio,
    obterValorMetadado,
    submeterRegistoAnimal
} from './api.js';

import {
    obterDadosTaxonomicos
} from './taxonomy.js';

import { GestorGamificacao, animalxConfig } from './gamification.js';




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
    const modalLoading = document.getElementById('modal-carregamento');

    if (modalLoading) modalLoading.style.setProperty('display', 'flex', 'important');
    if (elementoLegenda) elementoLegenda.innerHTML = "<em>A carregar dados do Omeka S...</em>";

    const item = await carregarItemAleatorio();


    if (item && item.fimDeRegistos) {
        if (elementoLegenda) elementoLegenda.innerHTML = "<b>Sem mais registos disponíveis.</b>";
        document.getElementById('modal-fim-registos').style.setProperty('display', 'flex', 'important');
        return;
    }

    // 2. Verifica se houve um erro crítico
    if (item && item.erroCritico) {
        if (elementoLegenda) elementoLegenda.innerHTML = `<span style='color:red;'><b>DIAGNÓSTICO:</b> ${item.erroCritico}</span>`;
        if (modalLoading) modalLoading.style.setProperty('display', 'none', 'important');
        return;
    }

    if (!item) {
        if (modalLoading) modalLoading.style.setProperty('display', 'none', 'important');
        return;
    }

    itemAtivo = item;
    inicializarImagemIIIF(item);
    injetarLegendaDinamica(item);

    if (modalLoading) modalLoading.style.setProperty('display', 'none', 'important');
}

window.carregarItemANIMALx = carregarEApresentarItem;

// ==========================================
// LEITURA GLOBAL DE TOTAIS DAS COLEÇÕES
// ==========================================
window.totaisColecoes = { azulejaria: 0, ceramica: 0, pintura: 0, gravura: 0, escultura: 0, desenho: 0 };

async function calcularTotaisColecoes() {
    console.log("🔍 A varrer o Mock DB para contar coleções (Ignorando memória antiga)...");
    
    // Invoca o cálculo local que criámos no api.js e atualiza imediatamente
    if (typeof window.calcularTotaisColecoesSimulacao === 'function') {
        window.totaisColecoes = window.calcularTotaisColecoesSimulacao();
        
        console.log("📊 Contagem global finalizada:", window.totaisColecoes);
    } else {
        console.error("❌ A função de simulação calcularTotaisColecoesSimulacao não foi encontrada!");
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
        
        // OS TEUS NOVOS TEXTOS PERSONALIZADOS
        const titulo = "O teu primeiro passo na História!";
        const texto = "Acabaste de entrar no arquivo do Museu de Lisboa como Curador Estagiário. Começa a explorar as coleções e ajuda-nos a desvendar as primeiras representações de animais.";
        
        if (typeof abrirModalNivel === 'function') {
            abrirModalNivel(titulo, texto, nivelEstagiario.imagem);
        }
        
        sessionStorage.setItem('animalx_boas_vindas', 'sim');
    }
}

window.darBoasVindasEstagiario = darBoasVindasEstagiario;

// ==========================================
// VALIDAÇÃO CRUZADA (MULTI-PEER REVIEW)
// ==========================================

const contagemAtual = obterContagemValidacoes(itemAtivo);
const novaContagem = contagemAtual + 1;

// 1. Destino do ITEM ORIGINAL (A Imagem Base): Fica no 1 até ter 5 votos
const destinoItemOriginal = novaContagem >= 5 ? 22 : 1;

// 2. Destino do NOVO ITEM (A tua classificação): Vai sempre para a 22 (oculto do sorteio)
const idColecaoDestino = 22
/**
 * Obtém a contagem atual de validações de um item.
 * Lê o valor do campo 'dcterms:audience' que armazena o número de avaliações.
 * 
 * @param {Object} item - Item do Omeka S
 * @returns {number} Número de validações (0 se não encontrado)
 */
function obterContagemValidacoes(item) {
    if (!item) return 0;
    
    const audienceRaw = obterValorMetadado(item, 'dcterms:audience');
    const contagem = parseInt(audienceRaw, 10);
    
    return isNaN(contagem) ? 0 : contagem;
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
export async function submeterFormularioReal() {
    try {
        console.log(' Iniciando submissão do formulário (Cópia Intermédia)...');
        
        // ============================================
        // PASSO 1: RECOLHA DO NOME DO UTILIZADOR
        // ============================================
        const modoParticipacao = document.querySelector('input[name="modo_participacao"]:checked')?.value;
        const consentimentoMarcado = document.getElementById('consentimento-dados')?.checked;
        let nomeUtilizador = 'Curador Anónimo';

        if (modoParticipacao === 'registar' && consentimentoMarcado) {
            const nomeInputado = document.getElementById('investigador-nome')?.value?.trim();
            if (nomeInputado && nomeInputado.length > 0) {
                nomeUtilizador = nomeInputado;
                sessionStorage.setItem('animalx_utilizador', nomeUtilizador);
            } else {
                const nomeStorage = sessionStorage.getItem('animalx_utilizador');
                if (nomeStorage && nomeStorage.length > 0) {
                    nomeUtilizador = nomeStorage;
                }
            }
        } else {
            sessionStorage.removeItem('animalx_utilizador');
        }

        // ============================================
        // PASSO 2: VALIDAÇÃO DO ITEM ATIVO
        // ============================================
        if (!itemAtivo || !itemAtivo['o:id']) {
            const mensagemErro = 'Nenhum item carregado para anotar. Carrega uma imagem primeiro.';
            console.error(`❌ ${mensagemErro}`);
            return { sucesso: false, erro: mensagemErro };
        }

        // ============================================
        // PASSO 3: RECOLHA DE DADOS E TAXONOMIA
        // ============================================
        const p1Resposta = document.querySelector('#opcoes-p1 .selecionado')?.innerText || "SIM";

        const isAnimalNaoSei = document.getElementById('check-nao-sei')?.checked;
        const animalSelecionado = isAnimalNaoSei ? "Não sei" : (document.getElementById('input-animal')?.value || "Não identificado");
        const infoTaxonomia = obterDadosTaxonomicos(animalSelecionado);

        const isQuantidadeNaoSei = document.getElementById('check-nao-sei-p3')?.checked;
        const quantidadeSelecionada = isQuantidadeNaoSei ? "Não sei" : (document.getElementById('input-quantidade')?.value || "Não especificado");

        const isFuncaoNaoSei = document.getElementById('check-nao-sei-p4')?.checked;
        const funcaoSelecionada = isFuncaoNaoSei ? "Não sei" : (document.getElementById('input-funcao')?.value || "Não especificado");

        const isDescricaoNaoSei = document.getElementById('check-nao-sei-p5')?.checked;
        const descricaoPreenchida = isDescricaoNaoSei ? "Sem descrição" : (document.getElementById('input-descricao')?.value || "");

        // ============================================
        // PASSO 4: EMPACOTAMENTO DOS DADOS LIMPOS
        // ============================================
        const dadosParaPainel = {
            'Curador': nomeUtilizador,
            'Tem animal?': p1Resposta,
            'Animal (Comum)': animalSelecionado,
            'Nome Científico': infoTaxonomia.cientifico,
            'Categoria': infoTaxonomia.categoria,
            'Quantidade': quantidadeSelecionada,
            'Função': funcaoSelecionada,
            'Descrição': descricaoPreenchida
        };

        // ============================================
        // PASSO 5: SUBMISSÃO (CRIAR CÓPIA INTERMÉDIA)
        // ============================================
        console.log(`🔄 A criar cópia no Conjunto Intermédio para o Item Base ID: ${itemAtivo['o:id']}...`);
        
        // Chamamos a função (POST) e passamos o pacote limpo e o item completo para clonagem
        const resultado = await submeterRegistoAnimal(dadosParaPainel, itemAtivo);

        if (resultado && resultado.sucesso) {
            console.log(` Sucesso! Cópia criada. A processar gamificação...`);

            const teveAnimal = p1Resposta === 'SIM';
            const teveDescricao = descricaoPreenchida.trim().length > 0 && !isDescricaoNaoSei;
            const colecaoItem = typeof identificarColecaoDoItem === 'function' ? identificarColecaoDoItem(itemAtivo) : "Desconhecida";

            // Aplica os pontos
            const infoJogo = GestorGamificacao.registarSubmissao(teveAnimal, teveDescricao, 0, colecaoItem, itemAtivo['o:id']);
            console.log(` Pontos: +${infoJogo.pontosGanhos} | Coleção: ${colecaoItem}`);


            if (infoJogo.nivelAtual.titulo === "Curador Estagiário") {
                    console.log("Subida para Estagiário ignorada (já mostrada no onboarding).");
                } else {
                    let titulo = "";
                    let texto = "";

                
                switch (infoJogo.nivelAtual.titulo) {
                    case "Curador Estagiário":
                        titulo = "O teu primeiro passo na História!";
                        texto = "Acabaste de entrar no arquivo do Museu de Lisboa como Curador Estagiário. Começa a explorar as coleções e ajuda-nos a desvendar as primeiras representações de animais.";
                        break;
                    case "Investigador Assistente":
                        titulo = "Foste promovido a Investigador Assistente!";
                        texto = "Com um “olfato de detetive” cada vez mais apurado, estás a ajudar a reescrever a história da cidade, uma representação animal de cada vez. Continua o excelente trabalho!";
                        break;
                    case "Historiador Especialista":
                        titulo = "Nenhum animal passa despercebido.";
                        texto = "O estatuto de Historiador Especialista é mais que merecido. O teu trabalho de catalogação é agora uma peça fundamental para reconstituir o passado animal na cidade de Lisboa.";
                        break;
                    case "Curador Catedrático":
                        titulo = "Um verdadeiro perito em História Animal!";
                        texto = "Atingiste o grau máximo de Curador Catedrático. O teu nome ficará para sempre ligado às maiores descobertas sobre a História Animal de Lisboa.";
                        break;
                    default:
                        titulo = `Novo Nível Alcançado!`;
                        texto = `Parabéns! És agora um ${infoJogo.nivelAtual.titulo}.`;
                }
                
                // Chama a função que desenha a modal no ecrã com os dados corretos
                abrirModalNivel(titulo, texto, infoJogo.nivelAtual.imagem);
            }

            return { sucesso: true, itemId: resultado.itemId };
        } else {
            throw new Error(resultado.erro || "Falha ao criar o registo intermédio.");
        }

    } catch (erro) {
        console.error('Erro ao submeter o formulário:', erro);
        return { sucesso: false, erro: erro.message || 'Erro inesperado ao submeter o formulário.' };
    }
}
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