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
        urlInfoJson: `https://DanielaTGomes.github.io/imagens_omeka/resultado/${codigoMedia}/info.json`,
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
    return `https://DanielaTGomes.github.io/imagens_omeka/resultado/${codigoMedia}/info.json`;
}

// =========================================
// SUBMISSÃO DUPLA (ITEM + MULTIMÉDIA) - MODO SIMULAÇÃO
// =========================================
async function submeterRegistoAnimal(dadosFormulario, itemOriginal) {
    try {
        console.log("🛠️ Simulação: A empacotar dados para o localStorage...");
        const nomeUtilizador = sessionStorage.getItem('animalx_utilizador') || 'Curador Anónimo';

        // Tempo de espera artificial para a barra "A guardar a tua descoberta..."
        await new Promise(resolve => setTimeout(resolve, 1500));

        const novoRegisto = {
            id: `simulacao-${Date.now()}`,
            dataSubmissao: new Date().toISOString(),
            autor: nomeUtilizador,
            dadosOriginais: itemOriginal,
            avaliacao: dadosFormulario,
            estado: "pendente"
        };

        // Gravação segura no navegador
        let dbSimulacao = JSON.parse(localStorage.getItem('animalx_mock_database')) || [];
        dbSimulacao.push(novoRegisto);
        localStorage.setItem('animalx_mock_database', JSON.stringify(dbSimulacao));

        console.log("✅ Registo arquivado na memória local!", novoRegisto);
        return { sucesso: true, itemId: novoRegisto.id };

    } catch (erro) {
        console.error('❌ Erro na simulação de submissão:', erro);
        return { sucesso: false, erro: erro.message };
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
