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
            
            let htmlItem = `
                <div class="item-curadoria">
                    <h2>${titulo} (ID: ${item['o:id']})</h2>
                    <p><strong>Avaliações comunitárias:</strong> ${historico.length}/5</p>
                    <div class="grid-respostas">
            `;

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
                            
                            htmlRespostas += `
                                <label style="cursor: pointer; display: flex; gap: 10px; align-items: start;">
                                    <input type="radio" name="${nomeGrupo}" value="${valorLimpo}" data-chave="${chave}">
                                    <span><strong>${chave}:</strong> ${valorLimpo}</span>
                                </label>
                            `;
                        }
                    }
                    htmlRespostas += `</div>`;

                    htmlItem += `
                        <div class="cartao-resposta">
                            <h3>Voluntário ${index + 1}</h3>
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
                    <div style="margin-top: 20px; padding-top: 15px; border-top: 2px dashed #5C2D91;">
                        <label style="display: block; font-weight: bold; margin-bottom: 5px;">Edição Manual (Opcional):</label>
                        <textarea id="manual_${item['o:id']}" rows="3" style="width: 100%; padding: 10px; border-radius: 5px;" placeholder="Escreve aqui a versão final..."></textarea>
                        
                        <div style="display: flex; gap: 10px; margin-top: 15px;">
                            <button onclick="extrairAnimal(${item['o:id']}, ${idOriginal})" style="background-color: #5C2D91; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; flex: 2;">
                                ➕ Extrair Animal Selecionado
                            </button>
                            
                            <button onclick="concluirCuradoria(${item['o:id']}, ${idOriginal})" style="background-color: #494949; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; flex: 1;">
                                ✅ Concluir e Arquivar
                            </button>
                        </div>
                        <div id="feedback_${item['o:id']}" style="margin-top: 10px; font-weight: bold; color: #5C2D91; font-size: 14px; text-align: center;"></div>
                    </div>
                </div>
            `;
            painel.innerHTML += htmlItem;
        });

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