import { CONFIG } from './config.js';

async function carregarPainelCuradoria() {
    const painel = document.getElementById('painel-resultados');
    
    // 1. Pede os itens à API (Sem restringir à coleção 22, para vermos o progresso contínuo)
    // 1. Pede os itens à API ordenados pelos que foram MODIFICADOS mais recentemente
    const url = `${CONFIG.API_URL}/items?sort_by=modified&sort_order=desc&key_identity=${CONFIG.KEY_IDENTITY}&key_credential=${CONFIG.KEY_CREDENTIAL}`;
    
    try {
        const resposta = await fetch(url);
        const itens = await resposta.json();

        painel.innerHTML = ""; // Limpa a mensagem de loading
        let encontrouAlgum = false;

        // 2. Varre os itens e desenha a interface APENAS para os que têm validações
        itens.forEach(item => {
            const historico = item['bibo:annotates'];
            
            // O FILTRO MÁGICO: Se não tiver anotações (ou seja, se for um "filho" ou um item intocado), ignora!
            if (!historico || historico.length === 0) return;
            
            encontrouAlgum = true; // Encontrámos um "pai" com validações!
            const titulo = item['o:title'] || 'Item sem título';
            
            let htmlItem = `
                <div class="item-curadoria">
                    <h2>${titulo} (ID: ${item['o:id']})</h2>
                    <p><strong>Avaliações comunitárias:</strong> ${historico.length}/5</p>
                    <div class="grid-respostas">
            `;
            
            // 3. Desempacota o JSON de cada voluntário
            historico.forEach((anotacao, index) => {
                try {
                    const pacote = JSON.parse(anotacao['@value']);
                    const dataFormatada = new Date(pacote.data).toLocaleString('pt-PT');
                    
                    let htmlRespostas = `<ul>`;
                    for (const [chave, valor] of Object.entries(pacote.respostas)) {
                        if(!chave.startsWith('@') && !chave.startsWith('o:')) {
                            const valorLimpo = Array.isArray(valor) ? valor[0]['@value'] : valor;
                            htmlRespostas += `<li><strong>${chave}:</strong> ${valorLimpo}</li>`;
                        }
                    }
                    htmlRespostas += `</ul>`;

                    htmlItem += `
                        <div class="cartao-resposta">
                            <h3>Voluntário ${index + 1}</h3>
                            <small>📅 ${dataFormatada}</small>
                            ${htmlRespostas}
                        </div>
                    `;
                } catch (e) {
                    console.warn("Anotação ignorada (não é um JSON legível):", e);
                }
            });

            htmlItem += `</div></div>`;
            painel.innerHTML += htmlItem;
        });

        if (!encontrouAlgum) {
            painel.innerHTML = "<p>Nenhum item com validações encontrado até ao momento.</p>";
        }

    } catch (erro) {
        console.error("Erro ao carregar itens para curadoria:", erro);
        painel.innerHTML = "<p style='color:red;'>Erro ao comunicar com a API do Omeka S.</p>";
    }
}

document.addEventListener('DOMContentLoaded', carregarPainelCuradoria);