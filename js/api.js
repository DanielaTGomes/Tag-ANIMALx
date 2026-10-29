import { ANIMALX_MOCK_DB } from './animalx_mock_db.js';

/**
 * Carrega um item aleatório da base de dados simulada.
 * Substitui o pedido Netlify por uma leitura do Mock DB local.
 */
async function carregarItemAleatorio() {
    try {
        console.log("🛠️ Simulação: A carregar a lista de imagens locais...");
        const items = ANIMALX_MOCK_DB;

        if (!Array.isArray(items) || items.length === 0) {
            return { erroCritico: `A base de dados simulada está vazia.` };
        }

        // 1. LER A LISTA DE ITENS JÁ VISTOS NESTA SESSÃO
        let vistosStr = sessionStorage.getItem('animalx_vistos');
        let itensVistos = vistosStr ? JSON.parse(vistosStr) : [];

        // 2. FILTRAR OS ITENS (Manter apenas os que NÃO estão na lista de vistos)
        const itensDisponiveis = items.filter(item => !itensVistos.includes(item['o:id']));

        // 3. SE NÃO HOUVER MAIS ITENS, AVISA O APP.JS
        if (itensDisponiveis.length === 0) {
            return { fimDeRegistos: true }; 
        }

        // 4. ESCOLHE UM ITEM ALEATÓRIO DOS QUE SOBRARAM
        const itemAleatorio = itensDisponiveis[Math.floor(Math.random() * itensDisponiveis.length)];
        
        // 5. REGISTA ESTE ITEM COMO "VISTO" PARA A PRÓXIMA VEZ
        itensVistos.push(itemAleatorio['o:id']);
        sessionStorage.setItem('animalx_vistos', JSON.stringify(itensVistos));

        // Simula o tempo de rede para ativar a animação roxa
        await new Promise(resolve => setTimeout(resolve, 1000));

        return itemAleatorio;

    } catch (erro) {
        return { erroCritico: `Falha na simulação (${erro.message}).` };
    }
}

/**
 * Obtém o primeiro valor legível de um campo de metadados do Omeka S.
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
        urlInfoJson: `https://projeto-ANIMALx.github.io/imagens_iiif/resultado/${codigoMedia}/info.json`,
        itemId: item?.['o:id'] ?? item?.id ?? '',
        metadata: JSON.stringify(item),
        legenda: `${titulo} (${dataRegisto}) de ${autoria}, disponível no acervo do Museu de Lisboa (${nInventario}).`
    };
}

// =========================================
// GERADOR DO LINK IIIF
// =========================================
function gerarUrlIiif(itemOriginal) {
    if (!itemOriginal || !itemOriginal['dcterms:identifier']) return null;
    const numInventario = itemOriginal['dcterms:identifier'][0]['@value'];
    const codigoMedia = numInventario.replaceAll('.', '_');
    return `https://projeto-ANIMALx.github.io/imagens_iiif/resultado/${codigoMedia}/info.json`;
}

// =========================================
// SUBMISSÃO E REGISTO EM JSON - MODO SIMULAÇÃO / EXPOSIÇÃO
// =========================================

async function submeterRegistoAnimal(dadosFormulario, itemOriginal) {
    try {
        console.log("🛠️ Simulação: A empacotar dados para o localStorage...");
        const nomeUtilizador = dadosFormulario['Curador'] || sessionStorage.getItem('animalx_utilizador') || 'Curador Anónimo';

        // Tempo de espera artificial para a animação de carregamento
        await new Promise(resolve => setTimeout(resolve, 1500));

        const agora = new Date();

        // Extrai os metadados essenciais do registo tratado para leitura rápida no JSON, mantendo também os dados brutos
        const metadadosRegistoTratado = {
            id_omeka: itemOriginal?.['o:id'] ?? '',
            n_inventario: obterValorMetadado(itemOriginal, 'dcterms:identifier') || 'S/N',
            titulo: obterValorMetadado(itemOriginal, 'dcterms:relation') || obterValorMetadado(itemOriginal, 'o:title') || 'Sem título',
            data_peca: obterValorMetadado(itemOriginal, 'dcterms:date') || 'S/D',
            autoria: obterValorMetadado(itemOriginal, 'dcterms:provenance') || 'Autoria desconhecida',
            tipologia: obterValorMetadado(itemOriginal, 'dcterms:type') || 'Não especificada'
        };

        const novoRegisto = {
            id: `simulacao-${Date.now()}`,
            diaSubmissao: agora.toLocaleDateString('pt-PT'),
            horaSubmissao: agora.toLocaleTimeString('pt-PT'),
            dataSubmissaoISO: agora.toISOString(),
            autor: nomeUtilizador,
            modoParticipacao: dadosFormulario['Modo de Participação'] || 'Anónimo',
            metadadosRegisto: metadadosRegistoTratado,
            respostasFormulario: dadosFormulario,
            dadosOriginaisCompletos: itemOriginal,
            estado: "pendente"
        };

        // 1. Gravação segura e cumulativa no navegador
        let dbSimulacao = JSON.parse(localStorage.getItem('animalx_mock_database')) || [];
        dbSimulacao.push(novoRegisto);
        localStorage.setItem('animalx_mock_database', JSON.stringify(dbSimulacao));

        console.log(`✅ Participação #${dbSimulacao.length} arquivada na memória local!`, novoRegisto);

        // 2. Sincroniza com o Gist ANTES de terminar a função!
        await sincronizarGistGitHub(dbSimulacao);

        // 3. Agora sim, termina e devolve o sucesso ao app.js
        return { sucesso: true, itemId: novoRegisto.id };

    } catch (erro) {
        console.error('❌ Erro na simulação de submissão:', erro);
        return { sucesso: false, erro: erro.message };
    }
}
window.sincronizarGistGitHub = sincronizarGistGitHub;
// =========================================
// EXPORTADOR DO FICHEIRO JSON DA EXPOSIÇÃO
// =========================================
window.descarregarRelatorioJSON = function() {
    const registos = JSON.parse(localStorage.getItem('animalx_mock_database')) || [];

    if (registos.length === 0) {
        alert("Ainda não existem participações registadas neste computador.");
        return;
    }

    const relatorioFinal = {
        projeto: "Tag ANIMALx - Registo de Participações",
        dataExportacao: new Date().toLocaleString('pt-PT'),
        totalParticipacoes: registos.length,
        participacoesRegistadasComNome: registos.filter(r => r.modoParticipacao === 'Registado').length,
        participacoesAnonimas: registos.filter(r => r.modoParticipacao === 'Anónimo').length,
        registos: registos
    };

    const jsonString = JSON.stringify(relatorioFinal, null, 2);
    const blob = new Blob([jsonString], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `participacoes_tag_animalx_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

// Atalho de teclado para a equipa na exposição: Ctrl + Shift + J descarrega o ficheiro JSON imediatamente
window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && (e.key === 'J' || e.key === 'j')) {
        e.preventDefault();
        window.descarregarRelatorioJSON();
    }
});

// =========================================
// SINCRONIZAÇÃO ASSÍNCRONA COM GIST SECRETO DO GITHUB
// =========================================
const GITHUB_GIST_ID = "36f68911041ce625fec7171c0abc1575";
const GITHUB_TOKEN = "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";

async function sincronizarGistGitHub(listaCompletaLocal) {
    console.log("☁️ A iniciar sincronização com o Gist do GitHub...");

    if (!GITHUB_GIST_ID || GITHUB_GIST_ID.includes("COLA_AQUI") || !GITHUB_TOKEN || GITHUB_TOKEN.includes("cola_aqui")) {
        console.error("❌ ERRO GIST: Falta preencher o GITHUB_GIST_ID ou o GITHUB_TOKEN no api.js!");
        return;
    }

    try {
        const pacoteNuvem = {
            projeto: "Tag ANIMALx - Exposição",
            ultimaAtualizacao: new Date().toLocaleString('pt-PT'),
            totalParticipacoes: listaCompletaLocal.length,
            participacoesComNome: listaCompletaLocal.filter(r => r.modoParticipacao === 'Registado').length,
            participacoesAnonimas: listaCompletaLocal.filter(r => r.modoParticipacao === 'Anónimo').length,
            registos: listaCompletaLocal
        };

        const resposta = await fetch(`https://api.github.com/gists/${GITHUB_GIST_ID.trim()}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN.trim()}`,
                'Accept': 'application/vnd.github+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                files: {
                    "participacoes_exposicao.json": {
                        content: JSON.stringify(pacoteNuvem, null, 2)
                    }
                }
            })
        });

        if (resposta.ok) {
            console.log("✅ GIST ATUALIZADO COM SUCESSO! Já podes fazer refresh à página do teu Gist.");
        } else {
            const detalheErro = await resposta.json();
            console.error(`❌ Erro do GitHub (${resposta.status}):`, detalheErro.message);
        }

    } catch (erro) {
        console.error("⚠️ Falha de rede ao tentar contactar o GitHub:", erro);
    }
}

// =========================================
// ATUALIZAÇÃO DO ITEM ORIGINAL (PATCH) - MODO SIMULAÇÃO
// =========================================
async function atualizarItemOriginal(itemOriginal, novaContagem, idColecaoDestino, dadosSubmissao) {
    console.log(`🛠️ Simulação: A ignorar o PATCH ao Item Original ${itemOriginal?.['o:id']} para não gerar erros de rede.`);
    return true;
}

// ==========================================
// EXTRATOR DE TOTAIS PARA MODO SIMULAÇÃO
// ==========================================
window.calcularTotaisColecoesSimulacao = function() {
    const totais = { azulejaria: 0, ceramica: 0, pintura: 0, gravura: 0, escultura: 0, desenho: 0 };
    
    // Dicionário de siglas presente nos inventários
    const mapaSiglas = {
        'AZU': 'azulejaria',
        'CER': 'ceramica',
        'PIN': 'pintura',
        'GRA': 'gravura',
        'ESC': 'escultura',
        'DES': 'desenho'
    };

    // Percorre os 100 itens da nossa base de testes
    ANIMALX_MOCK_DB.forEach(item => {
        // Tenta ler o número de inventário
        const metadado = item['dcterms:identifier'];
        const numInventario = Array.isArray(metadado) ? metadado[0]['@value'] : (metadado || '');

        if (numInventario) {
            for (const sigla in mapaSiglas) {
                if (numInventario.includes(sigla)) {
                    totais[mapaSiglas[sigla]] += 1;
                    break; 
                }
            }
        }
    });
    
    return totais;
};

export {
    carregarItemAleatorio,
    obterValorMetadado,
    prepararDadosDoItem,
    submeterRegistoAnimal,
    atualizarItemOriginal,
};
