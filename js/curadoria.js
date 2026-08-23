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
            


            // 3. Desempacota o JSON de cada voluntário e cria Radio Buttons
            historico.forEach((anotacao, index) => {
                try {
                    const pacote = JSON.parse(anotacao['@value']);
                    const dataFormatada = new Date(pacote.data).toLocaleString('pt-PT');
                    const idUnicoItem = item['o:id'];
                    
                    let htmlRespostas = `<div style="display: flex; flex-direction: column; gap: 8px; margin-top: 10px;">`;
                    
                    for (const [chave, valor] of Object.entries(pacote.respostas)) {
                        if(!chave.startsWith('@') && !chave.startsWith('o:')) {
                            const valorLimpo = Array.isArray(valor) ? valor[0]['@value'] : valor;
                            
                            // Cria um nome de grupo único para cada Item + Chave (ex: "15_Animal")
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
                    console.warn("Anotação ignorada (não é um JSON legível):", e);
                }
            });

            // 4. Adiciona a Edição Manual e o Botão de Aprovação no final do Item
           const idOriginal = item['dcterms:isReferencedBy']?.[0]?.['@value'] || 0;

            htmlItem += `
                    </div>
                    <div style="margin-top: 20px; padding-top: 15px; border-top: 2px dashed #5C2D91;">
                        <label style="display: block; font-weight: bold; margin-bottom: 5px;">Edição Manual (Opcional):</label>
                        <textarea id="manual_${item['o:id']}" rows="3" style="width: 100%; padding: 10px; border-radius: 5px;" placeholder="Escreve aqui a versão final se nenhuma das opções acima estiver 100% correta..."></textarea>
                        
                        <div style="display: flex; gap: 10px; margin-top: 15px;">
                            <button onclick="extrairAnimal(${item['o:id']}, ${idOriginal})" style="background-color: #5C2D91; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; flex: 2;">
                                ➕ Extrair Animal Selecionado
                            </button>
                            
                            <button onclick="concluirCuradoria(${item['o:id']}, ${idOriginal})" style="background-color: #494949; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; flex: 1;">
                                ✅ Concluir e Arquivar
                            </button>
                        </div>
                        
                        <!-- Pequena área para mostrar feedback de quantos animais já foram extraídos -->
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
        console.error("Erro ao carregar itens para curadoria:", erro);
        painel.innerHTML = "<p style='color:red;'>Erro ao comunicar com a API do Omeka S.</p>";
    }
}

document.addEventListener('DOMContentLoaded', carregarPainelCuradoria);

// ==========================================
// 1. EXTRAIR ANIMAL (Criar Registo Final)
// ==========================================
window.extrairAnimal = async function(idCopia, idOriginal) {
    const divFeedback = document.getElementById(`feedback_${idCopia}`);
    
    const radiosSelecionados = document.querySelectorAll(`input[name^="selecao_${idCopia}_"]:checked`);
    const edicaoManual = document.getElementById(`manual_${idCopia}`)?.value.trim();

    if (radiosSelecionados.length === 0 && !edicaoManual) {
        alert("⚠️ Seleciona as características do animal ou redige uma edição manual antes de extrair.");
        return;
    }

    divFeedback.innerText = "⏳ A ler propriedades do Omeka S e a criar registo...";

    const dadosFinais = {};
    radiosSelecionados.forEach(radio => dadosFinais[radio.getAttribute('data-chave')] = radio.value);
    
    // 👇 A MUDANÇA: Em vez de sobrepor a 'Descrição', criamos uma chave separada!
    if (edicaoManual) dadosFinais['Nota Curatorial'] = edicaoManual;

    try {
        const baseUrl = CONFIG.API_URL.replace(/\/+$/, '');
        const urlAuth = `key_identity=${CONFIG.KEY_IDENTITY}&key_credential=${CONFIG.KEY_CREDENTIAL}`;

        // Mapeamento Dinâmico de IDs
        const resProps = await fetch(`${baseUrl}/properties?${urlAuth}&per_page=1000`);
        const propriedadesData = await resProps.json();
        const mapaProps = {};
        propriedadesData.forEach(p => mapaProps[p['o:term']] = p['o:id']);

        // Formatador Seguro que injeta o property_id!
        const formatarSeguro = (valor, termo) => {
            if (!mapaProps[termo]) console.warn(`⚠️ Propriedade ${termo} não encontrada no Omeka!`);
            return [{
                "type": "literal",
                "property_id": mapaProps[termo] || 0,
                "@value": String(valor)
            }];
        };

        const resOriginal = await fetch(`${baseUrl}/items/${idOriginal}?${urlAuth}`);
        const itemOriginal = await resOriginal.json();

        const payloadNovoItem = {
            '@context': `${baseUrl}/api-context`,
            '@type': 'o:Item',
            'o:item_set': [ { 'o:id': 22 } ], // ⚠️ O ID do teu Conjunto de Saída Oficial
            'o:resource_template': itemOriginal['o:resource_template']
        };

        // Copia os metadados antigos (ignorando anotações de rascunho anteriores)
        for (const chave in itemOriginal) {
            if (!chave.startsWith('@') && !chave.startsWith('o:') && chave !== 'bibo:annotates') {
                payloadNovoItem[chave] = itemOriginal[chave];
            }
        }

        // Injeta as características usando o formatador seguro
        if (dadosFinais['Animal (Comum)']) payloadNovoItem['dcterms:title'] = formatarSeguro(dadosFinais['Animal (Comum)'], 'dcterms:title');
        if (dadosFinais['Tem animal?']) payloadNovoItem['dcterms:subject'] = formatarSeguro(dadosFinais['Tem animal?'], 'dcterms:subject');
        if (dadosFinais['Nome Científico']) payloadNovoItem['dwc:scientificName'] = formatarSeguro(dadosFinais['Nome Científico'], 'dwc:scientificName');
        if (dadosFinais['Categoria']) payloadNovoItem['dwc:taxonRank'] = formatarSeguro(dadosFinais['Categoria'], 'dwc:taxonRank');
        if (dadosFinais['Quantidade']) payloadNovoItem['dwc:organismScope'] = formatarSeguro(dadosFinais['Quantidade'], 'dwc:organismScope');
        if (dadosFinais['Função']) payloadNovoItem['dcterms:type'] = formatarSeguro(dadosFinais['Função'], 'dcterms:type');
        if (dadosFinais['Descrição']) payloadNovoItem['dcterms:description'] = formatarSeguro(dadosFinais['Descrição'], 'dcterms:description');
        if (dadosFinais['Curador']) payloadNovoItem['dcterms:contributor'] = formatarSeguro(dadosFinais['Curador'], 'dcterms:contributor');

        // 👇 A MUDANÇA: Injeta o apontamento curatorial no campo bibo:annotates do item final!
        if (dadosFinais['Nota Curatorial']) {
            payloadNovoItem['bibo:annotates'] = formatarSeguro(dadosFinais['Nota Curatorial'], 'bibo:annotates');
        }

        const resNovoItem = await fetch(`${baseUrl}/items?${urlAuth}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payloadNovoItem)
        });

        if (!resNovoItem.ok) throw new Error("Falha ao criar o item no Omeka S.");
        const novoItemData = await resNovoItem.json();

        // Clonar imagem
        if (itemOriginal['o:media'] && itemOriginal['o:media'].length > 0) {
            const resMedia = await fetch(`${itemOriginal['o:media'][0]['@id']}?${urlAuth}`);
            if (resMedia.ok) {
                const dadosMedia = await resMedia.json();
                const urlOrigem = dadosMedia['o:source'] || dadosMedia['o:original_url'];
                if (urlOrigem) {
                    await fetch(`${baseUrl}/media?${urlAuth}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            "o:ingester": dadosMedia['o:ingester'],
                            "file_index": 0,
                            "o:item": { "o:id": novoItemData['o:id'] },
                            "ingest_url": urlOrigem,
                            "o:source": urlOrigem
                        })
                    });
                }
            }
        }

        const nomeExtraido = dadosFinais['Animal (Comum)'] || 'Animal';
        divFeedback.innerHTML += `<br>✅ <b>${nomeExtraido}</b> extraído com sucesso! Podes selecionar outro ou concluir.`;
        
        radiosSelecionados.forEach(r => r.checked = false);
        if (document.getElementById(`manual_${idCopia}`)) document.getElementById(`manual_${idCopia}`).value = "";

    } catch (erro) {
        console.error("❌ Erro:", erro);
        divFeedback.innerHTML += `<br>❌ Erro ao extrair. Tenta novamente.`;
    }
};

// ==========================================
// 2. CONCLUIR E ARQUIVAR (Fim do Rascunho)
// ==========================================
window.concluirCuradoria = async function(idCopia, idOriginal) {
    if (!confirm("Queres concluir? O rascunho será apagado e a imagem retirada da fila pública.")) return;

    const divFeedback = document.getElementById(`feedback_${idCopia}`);
    divFeedback.innerText = "⏳ A limpar e a arquivar...";

    try {
        const baseUrl = CONFIG.API_URL.replace(/\/+$/, '');
        const urlAuth = `key_identity=${CONFIG.KEY_IDENTITY}&key_credential=${CONFIG.KEY_CREDENTIAL}`;

        // 1. Tira o Item Original da Coleção Pública (Evita o loop infinito)
        await fetch(`${baseUrl}/items/${idOriginal}?${urlAuth}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                '@context': `${baseUrl}/api-context`,
                '@type': 'o:Item',
                'o:item_set': [] // Deixa-o solto, saindo da Coleção 1
            })
        });

        // 2. Apaga a Cópia Intermédia
        await fetch(`${baseUrl}/items/${idCopia}?${urlAuth}`, { method: 'DELETE' });

        // 3. Apaga o cartão do ecrã
        const cartao = divFeedback.parentElement.parentElement;
        cartao.style.opacity = '0';
        setTimeout(() => cartao.remove(), 500);

    } catch (erro) {
        console.error("❌ Erro ao concluir:", erro);
        divFeedback.innerHTML = `❌ Erro a arquivar os ficheiros.`;
    }
};