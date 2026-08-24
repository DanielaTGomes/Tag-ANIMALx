async function carregarPainelCuradoria() {
    const painel = document.getElementById('painel-resultados');
    
    try {
        const resposta = await fetch('/.netlify/functions/carregar-curadoria?acao=itens');
        const itens = await resposta.json();

        painel.innerHTML = "";
        let encontrouAlgum = false;

        itens.forEach(item => {
            const historico = item['bibo:annotates'];
            if (!historico || historico.length === 0) return;
            
            encontrouAlgum = true;
            const titulo = item['o:title'] || 'Item sem título';
            
// ... (dentro do teu map / forEach do curadoria.js) ...
            
            let htmlItem = `
                <div class="item-curadoria">
                    <h2>${titulo} (ID: ${item['o:id']})</h2>
                    <p><strong>Avaliações comunitárias:</strong> ${historico.length}/5</p>
                    <div class="grid-respostas">
            `;

            // 3. Desempacota o JSON de cada utilizador
            historico.forEach((anotacao, index) => {
                try {
                    const pacote = JSON.parse(anotacao['@value']);
                    const dataFormatada = new Date(pacote.data).toLocaleString('pt-PT');
                    const idUnicoItem = item['o:id'];
                    
                    let htmlRespostas = `<div style="display: flex; flex-direction: column; gap: 8px; margin-top: 10px;">`;
                    
                    for (const [chave, valor] of Object.entries(pacote.respostas)) {
                        if(!chave.startsWith('@') && !chave.startsWith('o:')) {
                            const valorLimpo = Array.isArray(valor) ? valor[0]['@value'] : valor;
                            const nomeGrupo = `selecao_${idUnicoItem}_${chave.replace(/\s+/g, '')}`;
                            
                            // TRADUÇÕES VISUAIS: Altera o que aparece no ecrã sem estragar os dados originais
                            let chaveVisivel = chave;
                            if (chave === 'Função') chaveVisivel = 'Tipologia';
                            if (chave === 'Animal (Comum)') chaveVisivel = 'Nome Comum';
                            if (chave === 'Categoria') chaveVisivel = 'Categoria Taxonómica';
                            
                            htmlRespostas += `
                                <label class="curadoria-checkbox-label">
                                    <input type="checkbox" 
                                           name="${nomeGrupo}" 
                                           value="${valorLimpo}" 
                                           data-chave="${chave}"
                                           class="vol_${idUnicoItem}_${index}" 
                                           onchange="garantirSelecaoUnica(this)">
                                    <span class="curadoria-custom-checkbox"></span>
                                    <span><strong>${chaveVisivel}:</strong> ${valorLimpo}</span>
                                </label>
                            `;
                        }
                    }
                    htmlRespostas += `</div>`;

                    htmlItem += `
                        <div class="cartao-resposta">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <!-- MUDANÇA DE NOME: De Voluntário para Resposta -->
                                <h3>Resposta ${index + 1}</h3>
                                <button onclick="selecionarTudo('${idUnicoItem}', ${index})" class="btn-selecionar-tudo">
                                    Selecionar Registo
                                </button>
                            </div>
                            <small>📅 ${dataFormatada}</small>
                            ${htmlRespostas}
                        </div>
                    `;
                } catch (e) {
                    console.warn("Anotação ignorada:", e);
                }
            });

            const idOriginal = item['dcterms:isReferencedBy']?.[0]?.['@value'] || 0;

            htmlItem += `
                    </div>
                    <div class="curadoria-edicao-area">
                        <label class="curadoria-label">Edição Manual (Opcional):</label>
                        <textarea id="manual_${item['o:id']}" rows="3" class="curadoria-textarea" placeholder="Escreve aqui a versão final..."></textarea>
                        
                        <div class="curadoria-acoes">
                            <button onclick="extrairAnimal(${item['o:id']}, ${idOriginal})" class="btn-curadoria btn-extrair">
                                 Extrair Animal Selecionado
                            </button>
                            
                            <button onclick="concluirCuradoria(${item['o:id']}, ${idOriginal})" class="btn-curadoria btn-concluir">
                                Concluir e Arquivar Registo
                            </button>
                        </div>
                        <div id="feedback_${item['o:id']}" class="curadoria-feedback"></div>
                    </div>
                </div>
            `;

            painel.innerHTML += htmlItem;
        });

        // Remove o texto "A carregar..." do HTML depois de terminar
        const textoCarregamento = document.querySelector('#area-curadoria p');
        if (textoCarregamento) textoCarregamento.style.display = 'none';

        if (!encontrouAlgum) {
            painel.innerHTML = "<p>Nenhum item com validações encontrado até ao momento.</p>";
        }

    } catch (erro) {
        console.error("Erro ao carregar curadoria:", erro);
        painel.innerHTML = "<p style='color:red;'>Erro ao comunicar com o servidor.</p>";
    }
}

document.addEventListener('DOMContentLoaded', carregarPainelCuradoria);

window.extrairAnimal = async function(idCopia, idOriginal) {
    const divFeedback = document.getElementById(`feedback_${idCopia}`);
    const radiosSelecionados = document.querySelectorAll(`input[name^="selecao_${idCopia}_"]:checked`);
    const edicaoManual = document.getElementById(`manual_${idCopia}`)?.value.trim();

    if (radiosSelecionados.length === 0 && !edicaoManual) {
        alert("⚠️ Seleciona as características do animal ou redige uma edição manual.");
        return;
    }

    divFeedback.innerText = "⏳ A processar extração na nuvem...";

    const dadosFinais = {};
    radiosSelecionados.forEach(radio => dadosFinais[radio.getAttribute('data-chave')] = radio.value);
    if (edicaoManual) dadosFinais['Nota Curatorial'] = edicaoManual;

    try {
        const resposta = await fetch('/.netlify/functions/processar-curadoria', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tipo: 'extrair', idCopia, idOriginal, dadosFinais })
        });

        const resultado = await resposta.json();
        if (!resultado.sucesso) throw new Error("Falha na extração");

        divFeedback.innerHTML = `<br>✅ Animal extraído com sucesso!`;
        radiosSelecionados.forEach(r => r.checked = false);
        if (document.getElementById(`manual_${idCopia}`)) document.getElementById(`manual_${idCopia}`).value = "";

    } catch (erro) {
        console.error("❌ Erro:", erro);
        divFeedback.innerHTML = `<br>❌ Erro ao extrair. Tenta novamente.`;
    }
};

window.concluirCuradoria = async function(idCopia, idOriginal) {
    if (!confirm("Queres concluir? O rascunho será apagado e a imagem retirada da fila pública.")) return;

    const divFeedback = document.getElementById(`feedback_${idCopia}`);
    divFeedback.innerText = "⏳ A arquivar...";

    try {
        const resposta = await fetch('/.netlify/functions/processar-curadoria', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tipo: 'concluir', idCopia, idOriginal })
        });

        const resultado = await resposta.json();
        if (!resultado.sucesso) throw new Error("Falha ao arquivar");

        const cartao = divFeedback.parentElement.parentElement;
        cartao.style.opacity = '0';
        setTimeout(() => cartao.remove(), 500);

    } catch (erro) {
        console.error("❌ Erro:", erro);
        divFeedback.innerHTML = `❌ Erro a arquivar.`;
    }
};

// ==========================================
// FUNÇÕES DE ASSISTÊNCIA À SELEÇÃO
// ==========================================

// 1. Garante que só há uma checkbox marcada por cada campo (ex: só uma "Categoria")
window.garantirSelecaoUnica = function(elemento) {
    if (elemento.checked) {
        const grupo = document.querySelectorAll(`input[name="${elemento.name}"]`);
        grupo.forEach(chk => {
            if (chk !== elemento) chk.checked = false;
        });
    }
};

// 2. Seleciona o registo inteiro de um voluntário de uma só vez
window.selecionarTudo = function(idItem, indexVoluntario) {
    // Primeiro, limpa TODAS as seleções atuais deste Item
    const todasDoItem = document.querySelectorAll(`input[name^="selecao_${idItem}_"]`);
    todasDoItem.forEach(chk => chk.checked = false);

    // Depois, marca apenas as do voluntário escolhido
    const todasDoVoluntario = document.querySelectorAll(`.vol_${idItem}_${indexVoluntario}`);
    todasDoVoluntario.forEach(chk => chk.checked = true);
};