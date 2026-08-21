/**
 * Módulo de Taxonomia - TAG ANIMALx
 * 
 * Estrutura de dados e funções para mapeamento de nomes comuns de animais
 * para metadados científicos (Darwin Core).
 * 
 * @module taxonomy
 */

/**
 * Dicionário de dados com informações taxonómicas de animais.
 * Cada entrada contém:
 *   - comum: Nome(s) comum(ns) do animal (pode conter múltiplas variações separadas por barra)
 *   - cientifico: Nome científico (Género, Espécie ou Família conforme aplicável)
 *   - categoria: Categoria taxonómica (Classe, Ordem, Família, Género, Espécie)
 * 
 * @type {Array<{comum: string, cientifico: string, categoria: string}>}
 */
export const TAXONOMIA_ANIMALX = [
    // Insetos
    { comum: "Abelha", cientifico: "Apidae", categoria: "Família" },
    { comum: "Formiga", cientifico: "Formicidae", categoria: "Família" },
    { comum: "Vespa", cientifico: "Vespidae", categoria: "Família" },
    { comum: "Borboleta/Nocturna", cientifico: "Lepidoptera", categoria: "Ordem" },
    { comum: "Libélula", cientifico: "Odonata", categoria: "Ordem" },
    { comum: "Gafanhoto", cientifico: "Acrididae", categoria: "Família" },
    { comum: "Joaninha", cientifico: "Coccinellidae", categoria: "Família" },
    
    // Aves
    { comum: "Açor", cientifico: "Astur", categoria: "Género" },
    { comum: "Abutre", cientifico: "Gyps", categoria: "Género" },
    { comum: "Águia", cientifico: "Aquila", categoria: "Género" },
    { comum: "Corvo", cientifico: "Corvus", categoria: "Género" },
    { comum: "Gralha", cientifico: "Garrulus", categoria: "Género" },
    { comum: "Pombo", cientifico: "Columba", categoria: "Género" },
    { comum: "Pato/Pata", cientifico: "Anas", categoria: "Género" },
    { comum: "Ganso/Gansa", cientifico: "Anser", categoria: "Género" },
    { comum: "Cisne", cientifico: "Cygnus", categoria: "Género" },
    { comum: "Pardal", cientifico: "Passer", categoria: "Género" },
    { comum: "Mocho/Coruja", cientifico: "Strigiformes", categoria: "Ordem" },
    { comum: "Falcão", cientifico: "Falco", categoria: "Género" },
    { comum: "Cegonha", cientifico: "Ciconia", categoria: "Género" },
    
    // Mamíferos - Domésticos
    { comum: "Cão/Cadela", cientifico: "Canis familiaris", categoria: "Espécie" },
    { comum: "Gato/Gata", cientifico: "Felis catus", categoria: "Espécie" },
    { comum: "Cavalo/Égua", cientifico: "Equus caballus", categoria: "Espécie" },
    { comum: "Asno/Asna/Burro/Burra/Jumento", cientifico: "Equus asinus", categoria: "Espécie" },
    { comum: "Mula/Mulo", cientifico: "Equus asinus x Equus caballus", categoria: "Híbrido" },
    { comum: "Boi/Vaca/Novilho", cientifico: "Bos taurus", categoria: "Espécie" },
    { comum: "Ovelha/Carneiro", cientifico: "Ovis aries", categoria: "Espécie" },
    { comum: "Cabra/Bode", cientifico: "Capra aegagrus hircus", categoria: "Espécie" },
    { comum: "Porco/Porca/Leitão", cientifico: "Sus scrofa domesticus", categoria: "Espécie" },
    { comum: "Coelho/Coelha", cientifico: "Oryctolagus cuniculus", categoria: "Espécie" },
    { comum: "Galinha/Galo", cientifico: "Gallus gallus domesticus", categoria: "Espécie" },
    { comum: "Peru/Perua", cientifico: "Meleagris gallopavo", categoria: "Espécie" },
    
    // Mamíferos - Selvagens
    { comum: "Lobo", cientifico: "Canis lupus", categoria: "Espécie" },
    { comum: "Lince", cientifico: "Lynx", categoria: "Género" },
    { comum: "Urso", cientifico: "Ursus", categoria: "Género" },
    { comum: "Javali", cientifico: "Sus scrofa", categoria: "Espécie" },
    { comum: "Raposa", cientifico: "Vulpes vulpes", categoria: "Espécie" },
    { comum: "Texugo", cientifico: "Meles meles", categoria: "Espécie" },
    { comum: "Leitão", cientifico: "Sus scrofa", categoria: "Espécie" },
    { comum: "Veado/Corça", cientifico: "Cervus elaphus", categoria: "Espécie" },
    { comum: "Corço", cientifico: "Capreolus capreolus", categoria: "Espécie" },
    { comum: "Gazela", cientifico: "Gazella", categoria: "Género" },
    { comum: "Leão", cientifico: "Panthera leo", categoria: "Espécie" },
    { comum: "Leopardo/Pantera", cientifico: "Panthera pardus", categoria: "Espécie" },
    { comum: "Tigre", cientifico: "Panthera tigris", categoria: "Espécie" },
    { comum: "Elefante", cientifico: "Elephas", categoria: "Género" },
    { comum: "Rinoceronte", cientifico: "Rhinocerotidae", categoria: "Família" },
    { comum: "Hipopótamo", cientifico: "Hippopotamus amphibius", categoria: "Espécie" },
    
    // Mamíferos - Marinhos
    { comum: "Baleia-azul", cientifico: "Balaenoptera musculus", categoria: "Espécie" },
    { comum: "Baleia-corcunda", cientifico: "Megaptera novaeangliae", categoria: "Espécie" },
    { comum: "Golfinho", cientifico: "Delphinidae", categoria: "Família" },
    { comum: "Orca", cientifico: "Orcinus orca", categoria: "Espécie" },
    { comum: "Foca", cientifico: "Phocidae", categoria: "Família" },
    { comum: "Leão-marinho", cientifico: "Otariidae", categoria: "Família" },
    
    // Répteis
    { comum: "Cobra/Serpente", cientifico: "Serpentes", categoria: "Subordem" },
    { comum: "Lagarto", cientifico: "Lacertidae", categoria: "Família" },
    { comum: "Tartaruga", cientifico: "Testudines", categoria: "Ordem" },
    { comum: "Crocodilo", cientifico: "Crocodylus", categoria: "Género" },
    { comum: "Jacaré", cientifico: "Alligator", categoria: "Género" },
    
    // Anfíbios
    { comum: "Sapo", cientifico: "Bufo", categoria: "Género" },
    { comum: "Rã", cientifico: "Rana", categoria: "Género" },
    { comum: "Salamandra", cientifico: "Salamandra", categoria: "Género" },
    
    // Peixes
    { comum: "Truta", cientifico: "Salmo", categoria: "Género" },
    { comum: "Sardinha", cientifico: "Sardina", categoria: "Género" },
    { comum: "Atum", cientifico: "Thunnus", categoria: "Género" },
    { comum: "Linguado", cientifico: "Solea", categoria: "Género" },
    { comum: "Carpa", cientifico: "Cyprinus carpio", categoria: "Espécie" },
    
    // Roedores
    { comum: "Rato/Ratazana", cientifico: "Rattus", categoria: "Género" },
    { comum: "Rato-do-campo", cientifico: "Microtus", categoria: "Género" },
    { comum: "Esquilo", cientifico: "Sciurus", categoria: "Género" },
    { comum: "Toupeira", cientifico: "Talpa europaea", categoria: "Espécie" },
    { comum: "Ouriço", cientifico: "Erinaceus europaeus", categoria: "Espécie" }
];

/**
 * Obtém dados taxonómicos de um animal baseado no seu nome comum.
 * 
 * A função procura no dicionário TAXONOMIA_ANIMALX uma correspondência
 * com o nome comum fornecido. Para nomes comuns com múltiplas variações
 * (separadas por barra, ex: "Boi/Vaca"), utiliza a função includes()
 * para localizar correspondências parciais.
 * 
 * @param {string} nomeComumSelecionado - Nome comum do animal (valor do dropdown)
 * @returns {Object} Objeto com propriedades cientifico e categoria.
 *                   Se não encontrar, retorna valores padrão "Não identificado"
 * @example
 * // Uso
 * const dados = obterDadosTaxonomicos("Cão");
 * console.log(dados); 
 * // { cientifico: "Canis familiaris", categoria: "Espécie" }
 */
export function obterDadosTaxonomicos(nomeComumSelecionado) {
    // Validação básica do parâmetro de entrada
    if (!nomeComumSelecionado || typeof nomeComumSelecionado !== 'string') {
        return {
            cientifico: "Não identificado",
            categoria: "Não identificada"
        };
    }

    // Procura no dicionário por correspondência (case-insensitive)
    const nomeNormalizado = nomeComumSelecionado.trim().toLowerCase();
    
    const entrada = TAXONOMIA_ANIMALX.find(animal => 
        animal.comum.toLowerCase().includes(nomeNormalizado) ||
        nomeNormalizado.includes(animal.comum.toLowerCase().split('/')[0])
    );

    // Se encontrou, retorna os dados científicos; caso contrário, retorna valores padrão
    if (entrada) {
        return {
            cientifico: entrada.cientifico,
            categoria: entrada.categoria
        };
    }

    return {
        cientifico: "Não identificado",
        categoria: "Não identificada"
    };
}

/**
 * Guarda a seleção de animal no estado da sessão com mapeamento para Darwin Core.
 * 
 * Esta função integra-se com a estrutura global de submissão, mapeando os dados
 * do animal selecionado para os metadados padrão Darwin Core (dwc) e Dublin Core (dcterms).
 * 
 * @param {string} nomeComum - Nome comum do animal selecionado no dropdown
 * @returns {Object|null} Objeto com os dados mapeados ou null se erro
 * @example
 * // Uso
 * guardarSelecaoAnimal("Abelha");
 * // Atualiza window.dadosSubmissaoAtual com dados em Darwin Core
 */
export function guardarSelecaoAnimal(nomeComum) {
    // Valida o parâmetro
    if (!nomeComum || typeof nomeComum !== 'string') {
        console.warn('guardarSelecaoAnimal: nome comum inválido', nomeComum);
        return null;
    }

    // Inicializa o objeto global de dados de submissão se não existir
    if (!window.dadosSubmissaoAtual) {
        window.dadosSubmissaoAtual = {};
    }

    // Obtém os dados taxonómicos para o animal selecionado
    const dadosTaxonomicos = obterDadosTaxonomicos(nomeComum);

    // Mapeia para Dublin Core: título (nome comum)
    window.dadosSubmissaoAtual['dcterms:title'] = nomeComum;

    // Mapeia para Darwin Core: nome científico
    window.dadosSubmissaoAtual['dwc:scientificName'] = dadosTaxonomicos.cientifico;

    // Mapeia para Darwin Core: categoria taxonómica
    window.dadosSubmissaoAtual['dwc:taxonRank'] = dadosTaxonomicos.categoria;

    // Log para depuração (remover em produção se necessário)
    console.log('Animal selecionado:', {
        nomeComum,
        cientifico: dadosTaxonomicos.cientifico,
        categoria: dadosTaxonomicos.categoria,
        estadoSessao: window.dadosSubmissaoAtual
    });

    return window.dadosSubmissaoAtual;
}

/**
 * Retorna a lista de nomes comuns disponíveis para preencher dropdowns.
 * Útil para gerar opções de seleção dinamicamente.
 * 
 * @returns {Array<string>} Array com todos os nomes comuns únicos
 * @example
 * // Uso
 * const opcoes = obterListaNomesComuns();
 * opcoes.forEach(nome => {
 *     const option = document.createElement('option');
 *     option.value = nome;
 *     option.textContent = nome;
 *     selectElement.appendChild(option);
 * });
 */
export function obterListaNomesComuns() {
    return TAXONOMIA_ANIMALX.map(animal => animal.comum).sort();
}

/**
 * Retorna todos os dados para um animal específico (completo).
 * 
 * @param {string} nomeComum - Nome comum do animal
 * @returns {Object|null} Objeto completo da entrada ou null se não encontrado
 */
export function obterAnimalCompleto(nomeComum) {
    if (!nomeComum || typeof nomeComum !== 'string') {
        return null;
    }

    const nomeNormalizado = nomeComum.trim().toLowerCase();
    
    return TAXONOMIA_ANIMALX.find(animal => 
        animal.comum.toLowerCase().includes(nomeNormalizado) ||
        nomeNormalizado.includes(animal.comum.toLowerCase().split('/')[0])
    ) || null;
}