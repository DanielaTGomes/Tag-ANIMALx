// =========================================
// VARIÁVEIS GLOBAIS DE NAVEGAÇÃO
// =========================================
const totalPassos = 6; // Número total de perguntas no formulário
const totalFolhas = 2; // Número de páginas do caderno de campo
const totalPassosGuia = 6; // Número de passos do guia de instruções

let folhaAtual = 1;
let passoAtualGuia = 1;

// =========================================
// MODO ECRÃ INTEIRO
// =========================================
function toggleFullscreen() {
    const contentor = document.getElementById('animalx-gamification-wrapper');
    if (!document.fullscreenElement) {
        if (contentor.requestFullscreen) contentor.requestFullscreen().catch(console.error);
        else if (contentor.webkitRequestFullscreen) contentor.webkitRequestFullscreen();
    } else {
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    }
    window.addEventListener('DOMContentLoaded', () => {
    const emIframe = window.self !== window.top;
    const urlParams = new URLSearchParams(window.location.search);
    
    if (emIframe || urlParams.get('kiosk') === 'true') {
        document.body.classList.add('em-tela-cheia');
    }
});
}

document.addEventListener('fullscreenchange', () => {
    document.body.classList.toggle('em-tela-cheia', Boolean(document.fullscreenElement));
});

// =========================================
// NAVEGAÇÃO ENTRE TELAS PRINCIPAIS
// =========================================
function irParaTela(idTela) {
    if (typeof fecharTeclado === 'function') fecharTeclado();
    document.querySelectorAll('.animalx-screen').forEach(tela => tela.classList.remove('active'));
    
    const destino = document.getElementById(idTela);
    if (!destino) return;
    
    destino.classList.add('active');
    
    if (idTela === 'screen-formulario') {
            
            if (typeof window.carregarItemANIMALx === 'function') {
                window.carregarItemANIMALx();
            }
            

            if (typeof window.darBoasVindasEstagiario === 'function') {
                window.darBoasVindasEstagiario();
            }
        }

}

// =========================================
// CADERNO DE CAMPO
// =========================================
function abrirCaderno() {
    if (typeof window.atualizarCadernoDeCampo === 'function') window.atualizarCadernoDeCampo();
    document.getElementById('modal-caderno-campo')?.style.setProperty('display', 'flex', 'important');
}

function fecharCaderno() { 
    document.getElementById('modal-caderno-campo')?.style.setProperty('display', 'none', 'important'); 
}

function mudarFolhaCaderno(direcao) {
    const novaFolha = folhaAtual + direcao;
    if (novaFolha < 1 || novaFolha > totalFolhas) return;
    
    document.getElementById(`caderno-folha-${folhaAtual}`)?.classList.remove('active');
    document.getElementById(`caderno-folha-${novaFolha}`)?.classList.add('active');
    folhaAtual = novaFolha;
    
    atualizarBotoesNavegacao();
}

function atualizarBotoesNavegacao() {
    const anterior = document.getElementById('btn-caderno-prev');
    const seguinte = document.getElementById('btn-caderno-next');
    
    if (anterior) { 
        anterior.style.opacity = folhaAtual === 1 ? '0.4' : '1'; 
        anterior.style.pointerEvents = folhaAtual === 1 ? 'none' : 'auto'; 
    }
    if (seguinte) { 
        seguinte.style.opacity = folhaAtual === totalFolhas ? '0.4' : '1'; 
        seguinte.style.pointerEvents = folhaAtual === totalFolhas ? 'none' : 'auto'; 
    }
}

// =========================================
// NAVEGAÇÃO DO FORMULÁRIO (PERGUNTAS)
// =========================================
function irParaPasso(destino) {
    if (typeof fecharTeclado === 'function') fecharTeclado();
    for (let passo = 1; passo <= totalPassos; passo++) {
        document.getElementById(`passo-${passo}`)?.style.setProperty('display', passo === destino ? 'flex' : 'none', 'important');
    }
    
    const barra = document.getElementById('barra-progresso-form');
    if (barra) { 
        barra.style.width = `${(destino / totalPassos) * 100}%`; 
        barra.style.borderRadius = destino === totalPassos ? '15px' : '15px 0 0 15px'; 
    }
    
    const anterior = document.getElementById('btn-anterior-form');
    const seguinte = document.getElementById('btn-seguinte-form');
    const submeter = document.getElementById('btn-submeter-form');
    
    anterior?.style.setProperty('display', destino === 1 ? 'none' : 'flex', 'important');
    seguinte?.style.setProperty('display', destino === totalPassos ? 'none' : 'flex', 'important');
    submeter?.style.setProperty('display', destino === totalPassos ? 'block' : 'none', 'important');
    
    anterior?.setAttribute('onclick', `irParaPasso(${destino - 1})`);
    seguinte?.setAttribute('onclick', `avancarSeValido(${destino})`);
}

function selecionarOpcao(botao, grupoId) { 
    document.getElementById(grupoId)?.querySelectorAll('.animalx-btn-opcao').forEach(item => item.classList.toggle('selecionado', item === botao)); 
}
function acaoBotaoSim(botao, grupoId) { selecionarOpcao(botao, grupoId); }
function acaoBotaoNao(botao, grupoId) { selecionarOpcao(botao, grupoId); }

// =========================================
// DROPDOWNS E CAIXAS DE PESQUISA
// =========================================
function mostrarLista() { document.getElementById('lista-animais').style.display = 'block'; }
function selecionarNaoSei() {
    let input = document.getElementById("input-animal");
    
    if (input) input.value = ""; 
    
  
    let lista = document.getElementById("lista-animais");
    if (lista) lista.style.display = "none";
    

    let grupoOutro = document.getElementById("grupo-outro-animal");
    let inputOutro = document.getElementById("input-outro-animal");
    if (grupoOutro) grupoOutro.style.display = "none";
    if (inputOutro) inputOutro.value = "";
}
function selecionarAnimal(itemClicado) {
    let inputPrincipal = document.getElementById("input-animal"); 
    let grupoOutro = document.getElementById("grupo-outro-animal"); // Puxa o grupo inteiro
    let inputOutro = document.getElementById("input-outro-animal");
    
    let valorEscolhido = itemClicado.innerText;
    if (inputPrincipal) inputPrincipal.value = valorEscolhido;
    
    let lista = document.getElementById("lista-animais");
    if (lista) lista.style.display = "none";

    if (grupoOutro) {
        if (valorEscolhido.includes("Outro")) {
            grupoOutro.style.display = "flex";
            if (inputOutro) inputOutro.focus();
        } else {
            grupoOutro.style.display = "none";
            if (inputOutro) inputOutro.value = ""; 
        }
    }

    let radioNaoSei = document.getElementById("check-nao-sei");
    if (radioNaoSei) radioNaoSei.checked = false;
}
function filtrarAnimais() { 
    const input = document.getElementById('input-animal'); 
    const lista = document.getElementById('lista-animais'); 
    lista.style.display = 'block'; 
    [...lista.children].forEach(item => item.style.display = item.innerText.toUpperCase().includes(input.value.toUpperCase()) ? '' : 'none'); 
}

function mostrarListaQuantidade() { document.getElementById('lista-quantidade').style.display = 'block'; }
function selecionarQuantidade(item) { document.getElementById('input-quantidade').value = item.innerText; document.getElementById('lista-quantidade').style.display = 'none'; document.getElementById('check-nao-sei-p3').checked = false; }
function selecionarNaoSeiP3() { document.getElementById('input-quantidade').value = ''; document.getElementById('lista-quantidade').style.display = 'none'; }

function mostrarListaFuncao() { document.getElementById('lista-funcao').style.display = 'block'; }
function selecionarFuncao(item) { document.getElementById('input-funcao').value = item.innerText; document.getElementById('lista-funcao').style.display = 'none'; document.getElementById('check-nao-sei-p4').checked = false; }
function selecionarNaoSeiP4() { document.getElementById('input-funcao').value = ''; document.getElementById('lista-funcao').style.display = 'none'; }

function desmarcarNaoSeiP5() { document.getElementById('check-nao-sei-p5').checked = false; }
function selecionarNaoSeiP5() { document.getElementById('input-descricao').value = ''; }

document.addEventListener('click', evento => { 
    if (!evento.target.closest('.animalx-dropdown-pesquisa')) {
        document.querySelectorAll('.animalx-lista-opcoes').forEach(lista => lista.style.display = 'none'); 
    }
});

// =========================================
// MODAIS DE AVISO E GUIA DE INSTRUÇÕES
// =========================================
function abrirModalSubmissao() { document.getElementById('modal-submissao')?.style.setProperty('display', 'flex', 'important'); }
function fecharModal() { document.getElementById('modal-submissao')?.style.setProperty('display', 'none', 'important'); }

function abrirGuia() { 
    document.getElementById('modal-guia')?.style.setProperty('display', 'flex', 'important'); 
    passoAtualGuia = 1; 
    atualizarBotoesNavegacaoGuia(); 
}
function fecharGuia() {
    let modal = document.getElementById("modal-guia");
    if (modal) {modal.style.setProperty('display', 'none', 'important');}
    for (let i = 1; i <= 6; i++) {
        let passo = document.getElementById(`guia-passo-${i}`);
        if (passo) {passo.style.display = (i === 1) ? 'flex' : 'none'}}
    if (typeof passoGuiaAtual !== 'undefined') {passoGuiaAtual = 1;} else if (typeof window.passoGuiaAtual !== 'undefined') {
        window.passoGuiaAtual = 1;}
}

function mudarPassoGuia(direcao) { 
    const novo = passoAtualGuia + direcao; 
    if (novo < 1 || novo > totalPassosGuia) return; 
    document.getElementById(`guia-passo-${passoAtualGuia}`).style.display = 'none'; 
    document.getElementById(`guia-passo-${novo}`).style.display = 'flex'; 
    passoAtualGuia = novo; 
    atualizarBotoesNavegacaoGuia(); 
}
function atualizarBotoesNavegacaoGuia() { 
    document.getElementById('btn-guia-prev').style.visibility = passoAtualGuia === 1 ? 'hidden' : 'visible'; 
    document.getElementById('btn-guia-next').style.visibility = passoAtualGuia === totalPassosGuia ? 'hidden' : 'visible'; 
}

function abrirModalSair() { document.getElementById('modal-sair')?.style.setProperty('display', 'flex', 'important'); }
function fecharModalSair() { document.getElementById('modal-sair')?.style.setProperty('display', 'none', 'important'); }
function confirmarSaida() { 
    fecharModalSair(); 
    localStorage.removeItem('animalx_progresso'); 
    sessionStorage.removeItem('animalx_utilizador'); 
    sessionStorage.removeItem('animalx_vistos'); 
    sessionStorage.removeItem('animalx_boas_vindas'); 
    window.location.reload(); 
}

function abrirModalValidacao() { document.getElementById('modal-validacao')?.style.setProperty('display', 'flex', 'important'); }
function fecharModalValidacao() { document.getElementById('modal-validacao')?.style.setProperty('display', 'none', 'important'); }

// =========================================
// VALIDAÇÕES OBRIGATÓRIAS
// =========================================
function verificarRespostaNaoP1() {
    const containerP1 = document.getElementById('opcoes-p1');
    if (!containerP1) return false;
    const btnSelecionado = containerP1.querySelector('.animalx-btn-opcao.selecionado');
    return btnSelecionado ? btnSelecionado.innerText.trim().toUpperCase() === 'NÃO' : false;
}

function passoValido(passo) { 
    if (passo === 1 || passo === 6) return Boolean(document.getElementById(`opcoes-p${passo}`)?.querySelector('.selecionado')); 
    const campos = { 
        2: ['input-animal', 'check-nao-sei'], 
        3: ['input-quantidade', 'check-nao-sei-p3'], 
        4: ['input-funcao', 'check-nao-sei-p4'] 
    }; 
    if (!campos[passo]) return true; 
    return Boolean(document.getElementById(campos[passo][0]).value.trim() || document.getElementById(campos[passo][1]).checked); 
}

function avancarSeValido(passo) { 
    if (!passoValido(passo)) return abrirModalValidacao(); 
    
    if (passo === 1 && verificarRespostaNaoP1()) {
        return abrirModalSubmissao(); 
    }
    irParaPasso(passo + 1); 
}

function submeterSeValido(passo) { 
    passoValido(passo) ? abrirModalSubmissao() : abrirModalValidacao(); 
}

// =========================================
// FERRAMENTAS DE LIMPEZA E SUBMISSÃO AO OMEKA S
// =========================================
function verificarRespostaSimP6() {
    const containerP6 = document.getElementById('opcoes-p6');
    if (!containerP6) return false;
    const btnSim = Array.from(containerP6.querySelectorAll('.animalx-btn-opcao')).find(btn => btn.innerText.trim().toUpperCase() === 'SIM');
    return btnSim ? btnSim.classList.contains('selecionado') : false;
}

function limparCamposP2aP6() {
    const idInputs = ['input-animal', 'input-outro-animal', 'input-quantidade', 'input-funcao', 'input-descricao'];
    idInputs.forEach(id => { let el = document.getElementById(id); if (el) el.value = ''; });

    const idRadios = ['check-nao-sei', 'check-nao-sei-p3', 'check-nao-sei-p4', 'check-nao-sei-p5'];
    idRadios.forEach(id => { let radio = document.getElementById(id); if (radio) radio.checked = false; });

    const containerP6 = document.getElementById('opcoes-p6');
    if (containerP6) {
        let btns = containerP6.querySelectorAll('.animalx-btn-opcao');
        btns.forEach(btn => btn.classList.remove('selecionado'));
    }
    document.querySelectorAll('.animalx-lista-opcoes').forEach(lista => lista.style.display = 'none');
}


function limparCamposP2aP6Simulacao() {
    const idInputs = ['input-animal', 'input-outro-animal', 'input-quantidade', 'input-funcao', 'input-descricao'];
    idInputs.forEach(id => {
        let el = document.getElementById(id);
        if (el) el.value = '';
    });

    const idRadios = ['check-nao-sei', 'check-nao-sei-p3', 'check-nao-sei-p4', 'check-nao-sei-p5'];
    idRadios.forEach(id => {
        let radio = document.getElementById(id);
        if (radio) radio.checked = false;
    });

    const containerP6 = document.getElementById('opcoes-p6');
    if (containerP6) {
        let btns = containerP6.querySelectorAll('.animalx-btn-opcao');
        btns.forEach(btn => btn.classList.remove('selecionado'));
    }
}

function limparFormulario() {
    limparCamposP2aP6();
    const containerP1 = document.getElementById('opcoes-p1');
    if (containerP1) {
        let btns = containerP1.querySelectorAll('.animalx-btn-opcao');
        btns.forEach(btn => btn.classList.remove('selecionado'));
    }
}

async function confirmarSubmissao() {
    fecharModal(); 
    
    // Aciona a lógica pesada que já tens no app.js (Taxonomia, Gravação Local)
    const resultado = await window.submeterFormularioReal();
    
    if (resultado && resultado.sucesso) {
        const temOutroAnimal = verificarRespostaSimP6(); 
        
        if (temOutroAnimal) {
            limparCamposP2aP6Simulacao();
            irParaPasso(2);
        } else {
            limparFormulario();
            irParaPasso(1);
            
            // Pede ao Controlador para sortear nova imagem, injetar legenda e inicializar o IIIF
            if (typeof window.carregarItemANIMALx === 'function') {
                await window.carregarItemANIMALx();
            }
        }
    } else {
        alert("Falha na submissão do simulador.");
    }
}


// =========================================
// MODAIS DE RECOMPENSA E CONSENTIMENTO
// =========================================
function abrirModalNivel(titulo, texto, selo) { 
    const modal = document.getElementById('modal-nivel'); 
    if (!modal) return; 
    if (titulo) document.getElementById('titulo-novo-nivel').innerText = titulo; 
    if (texto) document.getElementById('texto-novo-nivel').innerText = texto; 
    if (selo) document.getElementById('imagem-novo-nivel').src = selo; 
    modal.style.setProperty('display', 'flex', 'important'); 
}
function fecharModalNivel() { document.getElementById('modal-nivel')?.style.setProperty('display', 'none', 'important'); }

function abrirModalConsentimento() { document.getElementById('modal-consentimento')?.style.setProperty('display', 'flex', 'important'); }
function fecharModalConsentimento() { document.getElementById('modal-consentimento')?.style.setProperty('display', 'none', 'important'); }

function verificarConsentimentoEAvancar() { 
    const modo = document.querySelector('input[name="modo_participacao"]:checked')?.value; 
    if (modo === 'registar' && !document.getElementById('consentimento-dados')?.checked) return abrirModalConsentimento(); 
    irParaTela('screen-formulario'); 
}

// =========================================
// INJEÇÃO GLOBAL (Disponibiliza as funções para o HTML)
// =========================================
Object.assign(window, { 
    toggleFullscreen, irParaTela, abrirCaderno, fecharCaderno, mudarFolhaCaderno, 
    irParaPasso, selecionarOpcao, acaoBotaoSim, acaoBotaoNao, mostrarLista, 
    selecionarNaoSei, selecionarAnimal, filtrarAnimais, mostrarListaQuantidade, 
    selecionarQuantidade, selecionarNaoSeiP3, mostrarListaFuncao, selecionarFuncao, 
    selecionarNaoSeiP4, desmarcarNaoSeiP5, selecionarNaoSeiP5, abrirModalSubmissao, 
    fecharModal, abrirGuia, fecharGuia, mudarPassoGuia, abrirModalSair, 
    fecharModalSair, confirmarSaida, abrirModalValidacao, fecharModalValidacao, 
    avancarSeValido, submeterSeValido, abrirModalNivel, fecharModalNivel, 
    abrirModalConsentimento, fecharModalConsentimento, confirmarSubmissao,
    verificarConsentimentoEAvancar 
});

// Inicializa a interface corretamente assim que a página arranca
document.addEventListener('DOMContentLoaded', () => { 
    irParaPasso(1); 
    atualizarBotoesNavegacao(); 
});

// =========================================
// LÓGICA DO TECLADO VIRTUAL (ACENTOS + DRAG & DROP + ESCALA)
// =========================================

let inputAtivo = null;
let timerPressaoLonga = null;
let popupAcentosAtivo = null;
let pressaoLongaAtivada = false;

const MAPA_ACENTOS = {
    'A': ['Á', 'À', 'Â', 'Ã'],
    'E': ['É', 'Ê'],
    'I': ['Í'],
    'O': ['Ó', 'Ô', 'Õ'],
    'U': ['Ú'],
    'C': ['Ç']
};

function obterEscalaWrapper() {
    const wrapper = document.getElementById('animalx-gamification-wrapper');
    if (!wrapper) return 1;
    const rect = wrapper.getBoundingClientRect();
    return rect.width / (wrapper.offsetWidth || 1266);
}

function inicializarTecladoVirtual() {
    const teclado = document.getElementById('teclado-virtual');
    const wrapper = document.getElementById('animalx-gamification-wrapper');
    if (!teclado) return;

    // Garante que o teclado está dentro do #animalx-gamification-wrapper para escalar sempre a 67%
    if (wrapper && teclado.parentElement !== wrapper) {
        wrapper.appendChild(teclado);
    }

    // 1. SISTEMA DE ARRASTAR O TECLADO (DRAG & DROP)
    let aArrastar = false;
    let inicioX = 0, inicioY = 0;
    let inicialLeft = 0, inicialTop = 0;

    teclado.addEventListener('pointerdown', (e) => {
        // Se tocou num acento do pop-up, escreve o acento imediatamente!
        const btnAcento = e.target.closest('.tecla-acento');
        if (btnAcento) {
            e.preventDefault();
            e.stopPropagation();
            digitarChar(btnAcento.dataset.acento);
            fecharPopupAcentos();
            return;
        }

        // Se tocou no botão X de fechar no topo
        const btnFecharTopo = e.target.closest('.teclado-fechar-topo');
        if (btnFecharTopo) {
            e.preventDefault();
            fecharTeclado();
            return;
        }

        // Se tocou na barra de arrasto ou no fundo roxo do teclado (fora das teclas), inicia o arrasto
        if (!e.target.closest('.tecla')) {
            e.preventDefault();
            aArrastar = true;
            inicioX = e.clientX;
            inicioY = e.clientY;
            inicialLeft = teclado.offsetLeft;
            inicialTop = teclado.offsetTop;
            teclado.setPointerCapture(e.pointerId);
        } else {
            // Impede que o clique numa tecla tire o foco da caixa de texto
            e.preventDefault();
        }
    });

    teclado.addEventListener('pointermove', (e) => {
        if (!aArrastar) return;
        e.preventDefault();

        const escala = obterEscalaWrapper();
        const deltaX = (e.clientX - inicioX) / escala;
        const deltaY = (e.clientY - inicioY) / escala;

        const maxLeft = (wrapper ? wrapper.scrollWidth : 1266) - teclado.offsetWidth;
        const maxTop = (wrapper ? wrapper.scrollHeight : 900) - teclado.offsetHeight;

        const novoLeft = Math.max(0, Math.min(maxLeft, inicialLeft + deltaX));
        const novoTop = Math.max(0, Math.min(maxTop, inicialTop + deltaY));

        teclado.style.left = `${novoLeft}px`;
        teclado.style.top = `${novoTop}px`;
    });

    teclado.addEventListener('pointerup', (e) => {
        if (aArrastar) {
            aArrastar = false;
            try { teclado.releasePointerCapture(e.pointerId); } catch (_) {}
        }
    });

    // 2. CONFIGURAÇÃO DAS TECLAS E LONG-PRESS
    const teclas = teclado.querySelectorAll('.tecla');
    teclas.forEach(tecla => {
        const charBase = tecla.dataset.char;
        const acao = tecla.dataset.action;

        if (charBase && MAPA_ACENTOS[charBase]) {
            tecla.classList.add('tem-acentos');
        }

        tecla.addEventListener('pointerdown', (e) => {
            // Ignora se o clique veio do pop-up de acentos filho desta tecla
            if (e.target.closest('.acentos-popup')) return;

            e.preventDefault();
            pressaoLongaAtivada = false;
            fecharPopupAcentos();

            if (charBase && MAPA_ACENTOS[charBase]) {
                timerPressaoLonga = setTimeout(() => {
                    pressaoLongaAtivada = true;
                    mostrarPopupAcentos(tecla, MAPA_ACENTOS[charBase]);
                }, 350);
            }
        });

        tecla.addEventListener('pointerup', (e) => {
            if (e.target.closest('.acentos-popup')) return;

            e.preventDefault();
            clearTimeout(timerPressaoLonga);

            if (!pressaoLongaAtivada) {
                if (charBase) {
                    digitarChar(charBase);
                } else if (acao === 'backspace') {
                    apagarChar();
                } else if (acao === 'close') {
                    fecharTeclado();
                }
            }
        });

        tecla.addEventListener('pointerleave', () => {
            clearTimeout(timerPressaoLonga);
        });
        tecla.addEventListener('pointercancel', () => {
            clearTimeout(timerPressaoLonga);
        });
    });
}

function mostrarPopupAcentos(teclaElemento, listaAcentos) {
    fecharPopupAcentos();

    const popup = document.createElement('div');
    popup.className = 'acentos-popup';

    listaAcentos.forEach(acento => {
        const btnAcento = document.createElement('button');
        btnAcento.type = 'button';
        btnAcento.className = 'tecla-acento';
        btnAcento.dataset.acento = acento;
        btnAcento.innerText = acento;
        popup.appendChild(btnAcento);
    });

    teclaElemento.appendChild(popup);
    popupAcentosAtivo = popup;
}

function fecharPopupAcentos() {
    if (popupAcentosAtivo) {
        popupAcentosAtivo.remove();
        popupAcentosAtivo = null;
    }
}

// Abre o teclado ao tocar numa caixa de texto editável
document.addEventListener('focusin', function(e) {
    const el = e.target;
    const isInputTexto = el.tagName === 'INPUT' && el.type === 'text' && !el.hasAttribute('readonly');
    const isTextarea = el.tagName === 'TEXTAREA' && !el.hasAttribute('readonly');

    if (isInputTexto || isTextarea) {
        inputAtivo = el;
        abrirTeclado(el);
    }
});

// Fecha o teclado automaticamente ao escolher um animal da lista (exceto "Outro")
document.addEventListener('click', function(e) {
    const itemLista = e.target.closest('#lista-animais li');
    if (itemLista && !itemLista.innerText.includes('Outro')) {
        fecharTeclado();
    }
});

// Fecha o pop-up de acentos se tocar fora dele
document.addEventListener('pointerdown', function(e) {
    if (popupAcentosAtivo && !e.target.closest('.acentos-popup')) {
        fecharPopupAcentos();
    }
});

function abrirTeclado(elementoFocado) {
    const teclado = document.getElementById('teclado-virtual');
    const wrapper = document.getElementById('animalx-gamification-wrapper');
    if (!teclado) return;

    // Posição inicial inteligente que não tapa nem a imagem nem a caixa de texto à direita:
    // No formulário de perguntas, abre no canto inferior esquerdo (por baixo da pergunta, ao lado da textarea)!
    if (elementoFocado && elementoFocado.closest('#screen-formulario')) {
        teclado.style.left = '80px';
        teclado.style.top = '545px';
    } else {
            const scrollY = wrapper ? wrapper.scrollTop : 0;
            teclado.style.left = '293px';
            teclado.style.top = `${560 + scrollY}px`; 
            
            setTimeout(() => {
                elementoFocado?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
    }

    teclado.classList.remove('teclado-escondido');
}

function fecharTeclado() {
    fecharPopupAcentos();
    const teclado = document.getElementById('teclado-virtual');
    if (teclado) teclado.classList.add('teclado-escondido');
    if (inputAtivo) {
        inputAtivo.blur();
        inputAtivo = null;
    }
}

function digitarChar(letra) {
    if (!inputAtivo) return;

    const start = typeof inputAtivo.selectionStart === 'number' ? inputAtivo.selectionStart : inputAtivo.value.length;
    const end = typeof inputAtivo.selectionEnd === 'number' ? inputAtivo.selectionEnd : inputAtivo.value.length;
    const textoAtual = inputAtivo.value;

    inputAtivo.value = textoAtual.slice(0, start) + letra + textoAtual.slice(end);

    try {
        inputAtivo.selectionStart = inputAtivo.selectionEnd = start + letra.length;
    } catch (_) {}

    inputAtivo.focus();
    inputAtivo.dispatchEvent(new Event('input', { bubbles: true }));
    inputAtivo.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
}

function apagarChar() {
    if (!inputAtivo) return;

    const start = typeof inputAtivo.selectionStart === 'number' ? inputAtivo.selectionStart : inputAtivo.value.length;
    const end = typeof inputAtivo.selectionEnd === 'number' ? inputAtivo.selectionEnd : inputAtivo.value.length;
    const textoAtual = inputAtivo.value;

    if (start !== end) {
        inputAtivo.value = textoAtual.slice(0, start) + textoAtual.slice(end);
        try { inputAtivo.selectionStart = inputAtivo.selectionEnd = start; } catch (_) {}
    } else if (start > 0) {
        inputAtivo.value = textoAtual.slice(0, start - 1) + textoAtual.slice(start);
        try { inputAtivo.selectionStart = inputAtivo.selectionEnd = start - 1; } catch (_) {}
    }

    inputAtivo.focus();
    inputAtivo.dispatchEvent(new Event('input', { bubbles: true }));
    inputAtivo.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
}

window.abrirTeclado = abrirTeclado;
window.fecharTeclado = fecharTeclado;
window.digitarChar = digitarChar;
window.apagarChar = apagarChar;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarTecladoVirtual);
} else {
    inicializarTecladoVirtual();
}