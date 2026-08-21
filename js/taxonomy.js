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
    { comum: "Abelha", cientifico: "Apidae", categoria: "Família" },
    { comum: "Açor", cientifico: "Astur", categoria: "Género" },
    { comum: "Águia", cientifico: "Accipitridae", categoria: "Família" },
    { comum: "Albatroz", cientifico: "Diomedea", categoria: "Género" },
    { comum: "Andorinha", cientifico: "Hirundinidae", categoria: "Família" },
    { comum: "Animais vários - terrestres (carne; gado)", cientifico: "Gado", categoria: "sem categoria taxonómica" },
    { comum: "Animais Vários - aquáticos", cientifico: "", categoria: "sem categoria taxonómica" },
    { comum: "Antílope", cientifico: "Antilopinae", categoria: "Subfamília" },
    { comum: "Arara", cientifico: "Psittacidae", categoria: "Família" },
    { comum: "Aranha", cientifico: "Araneae", categoria: "Ordem" },
    { comum: "Arenque", cientifico: "Clupea", categoria: "Género" },
    { comum: "Asno/Asna/Burro/Burra/Jumento", cientifico: "Equus asinus", categoria: "Espécie" },
    { comum: "Atum", cientifico: "Scombridae", categoria: "Família" },
    { comum: "Atum-rabilho", cientifico: "Thunnus thynnus", categoria: "Espécie" },
    { comum: "Ave", cientifico: "Aves", categoria: "Classe" },
    { comum: "Ave de capoeira", cientifico: "Galliformes", categoria: "Ordem" },
    { comum: "Ave de rapina", cientifico: "Accipitriformes", categoria: "Ordem" },
    { comum: "Azevia", cientifico: "Microchirus azevia", categoria: "Espécie" },
    { comum: "Bacalhau", cientifico: "Gadidae", categoria: "Família" },
    { comum: "Baleia/Cetáceo", cientifico: "Cetacea", categoria: "Ordem" },
    { comum: "Baleia de barbas", cientifico: "Mysticeti", categoria: "Subordem" },
    { comum: "Baleia-corcunda", cientifico: "Megaptera novaeangliae", categoria: "Espécie" },
    { comum: "Beija-flor", cientifico: "Trochilidae", categoria: "Família" },
    { comum: "Bestas (animais de carga)", cientifico: "Equidae", categoria: "Família" },
    { comum: "Besouro", cientifico: "Coleoptera", categoria: "Ordem" },
    { comum: "Boi/vaca/vitela/bezerro", cientifico: "Bos taurus", categoria: "Espécie" },
    { comum: "Bicho da Seda", cientifico: "Bombyx mori", categoria: "Espécie" },
    { comum: "Boi de Angola", cientifico: "Bos taurus", categoria: "Espécie" },
    { comum: "Borboleta", cientifico: "Lepidoptera", categoria: "Ordem" },
    { comum: "Burro", cientifico: "Equus asinus", categoria: "Espécie" },
    { comum: "Búzio", cientifico: "Caenogastropoda", categoria: "Infraclasse" },
    { comum: "Cão", cientifico: "Canis familiaris", categoria: "Espécie" },
    { comum: "Cabra/Cabrão/Bode/Cabrito", cientifico: "Capra hircus", categoria: "Espécie" },
    { comum: "Cação", cientifico: "Triakidae", categoria: "Família" },
    { comum: "Camaleão", cientifico: "Chamaeleonidae", categoria: "Família" },
    { comum: "Camarão", cientifico: "Decapoda", categoria: "Ordem" },
    { comum: "Camelo", cientifico: "Camelus", categoria: "Género" },
    { comum: "Canário", cientifico: "Serinus canaria", categoria: "Espécie" },
    { comum: "Caracol", cientifico: "Stylommatophora", categoria: "Superordem" },
    { comum: "Caramujo", cientifico: "Gastropoda", categoria: "Classe" },
    { comum: "Caranguejo", cientifico: "Brachyura", categoria: "Infraordem" },
    { comum: "Carapau", cientifico: "Trachurus", categoria: "Género" },
    { comum: "Carneiro/Ovelha", cientifico: "Ovis aries", categoria: "Espécie" },
    { comum: "Cavalo/Égua/Potro", cientifico: "Equus caballus", categoria: "Espécie" },
    { comum: "Cavalo-marinho", cientifico: "Hippocampus", categoria: "Género" },
    { comum: "Cegonha", cientifico: "Ciconiidae", categoria: "Família" },
    { comum: "Cervídeo", cientifico: "Cervidae", categoria: "Família" },
    { comum: "Chita", cientifico: "Acinonyx jubatus", categoria: "Espécie" },
    { comum: "Choco", cientifico: "Sepia", categoria: "Género" },
    { comum: "Cisne", cientifico: "Cygnus", categoria: "Género" },
    { comum: "Cobra", cientifico: "Elapidae", categoria: "Família" },
    { comum: "Cobra-rateira", cientifico: "Malpolon monspessulanus", categoria: "Espécie" },
    { comum: "Cobra-rateira-mandarim", cientifico: "Euprepiophis mandarinus", categoria: "Espécie" },
    { comum: "Coelho", cientifico: "Oryctolagus cuniculus", categoria: "Espécie" },
    { comum: "Colhereiro", cientifico: "Platalea leucorodia", categoria: "Espécie" },
    { comum: "Concha", cientifico: "Mollusca", categoria: "Filo" },
    { comum: "Congro/Safio", cientifico: "Conger conger", categoria: "Espécie" },
    { comum: "Coral", cientifico: "Anthozoa", categoria: "Classe" },
    { comum: "Coruja", cientifico: "Strigidae", categoria: "Família" },
    { comum: "Corvo", cientifico: "Corvus corax", categoria: "Espécie" },
    { comum: "Corvo-marinho-de-faces-brancas", cientifico: "Phalacrocorax", categoria: "Género" },
    { comum: "Craca", cientifico: "Thoracica", categoria: "Superordem" },
    { comum: "Crocodilo", cientifico: "Crocodylidae", categoria: "Família" },
    { comum: "Dragão da Índia", cientifico: "Draco lineatus", categoria: "Espécie" },
    { comum: "Dromedário", cientifico: "Camelus dromedarius", categoria: "Espécie" },
    { comum: "Elefante", cientifico: "Elephantidae", categoria: "Família" },
    { comum: "Elefante asiático", cientifico: "Elephas", categoria: "Género" },
    { comum: "Elefante africano", cientifico: "Loxodonta", categoria: "Género" },
    { comum: "Escorpião", cientifico: "Scorpiones", categoria: "Ordem" },
    { comum: "Esquilo", cientifico: "Sciuridae", categoria: "Família" },
    { comum: "Falcão", cientifico: "Falco", categoria: "Género" },
    { comum: "Faisão", cientifico: "Phasianidae", categoria: "Família" },
    { comum: "Gado bovino", cientifico: "Bos taurus", categoria: "Espécie" },
    { comum: "Gaivota", cientifico: "Larus", categoria: "Género" },
    { comum: "Galinha/Galo/Capão", cientifico: "Gallus gallus", categoria: "Espécie" },
    { comum: "Gamo", cientifico: "Dama dama", categoria: "Espécie" },
    { comum: "Ganso", cientifico: "Anatidae", categoria: "Família" },
    { comum: "Garça", cientifico: "Ardeidae", categoria: "Família" },
    { comum: "Gato", cientifico: "Felis catus", categoria: "Espécie" },
    { comum: "Gato-almiscarado", cientifico: "Civettictis civetta", categoria: "Espécie" },
    { comum: "Gazela", cientifico: "Gazella", categoria: "Género" },
    { comum: "Girafa", cientifico: "Giraffa", categoria: "Género" },
    { comum: "Golfinho", cientifico: "Delphinidae", categoria: "Família" },
    { comum: "Golfinho-comum", cientifico: "Delphinus delphis", categoria: "Espécie" },
    { comum: "Guarda-rios", cientifico: "Alcedo atthis", categoria: "Espécie" },
    { comum: "Guaxinim", cientifico: "Procyon lotor", categoria: "Espécie" },
    { comum: "Hipopótamo", cientifico: "Hippopotamidae", categoria: "Família" },
    { comum: "Inseto", cientifico: "Insecta", categoria: "Classe" },
    { comum: "Jacaré", cientifico: "Alligatoridae", categoria: "Família" },
    { comum: "Jaguar", cientifico: "Panthera onca", categoria: "Espécie" },
    { comum: "Jandaia-amarela", cientifico: "Aratinga solstitialis", categoria: "Espécie" },
    { comum: "Javali/Porco-montês", cientifico: "Sus scrofa", categoria: "Espécie" },
    { comum: "Lagarto", cientifico: "Squamata", categoria: "Ordem" },
    { comum: "Lagosta", cientifico: "Pleocyemata", categoria: "Subordem" },
    { comum: "Lagostim", cientifico: "Astacidae", categoria: "Família" },
    { comum: "Leão", cientifico: "Panthera leo", categoria: "Espécie" },
    { comum: "Leão-marinho", cientifico: "Otariidae", categoria: "Família" },
    { comum: "Lebre", cientifico: "Lepus", categoria: "Género" },
    { comum: "Leopardo", cientifico: "Panthera pardus", categoria: "Espécie" },
    { comum: "Lince", cientifico: "Lynx", categoria: "Género" },
    { comum: "Lobo", cientifico: "Canis lupus", categoria: "Espécie" },
    { comum: "Lontra", cientifico: "Lutrinae", categoria: "Subfamília" },
    { comum: "Louva-a-Deus-comum", cientifico: "Mantis religiosa", categoria: "Espécie" },
    { comum: "Macaco", cientifico: "Simiiformes", categoria: "Infraordem" },
    { comum: "Manatim", cientifico: "Trichechus", categoria: "Género" },
    { comum: "Marisco", cientifico: "", categoria: "sem categoria taxonómica" },
    { comum: "Mexilhão", cientifico: "Bivalvia", categoria: "Classe" },
    { comum: "Mosca", cientifico: "Musca domestica", categoria: "Espécie" },
    { comum: "Mosquito", cientifico: "Culicidae", categoria: "Família" },
    { comum: "Mula/Mulo", cientifico: "Equus", categoria: "Género" },
    { comum: "Muge/Tainha/Fataça", cientifico: "Mullus", categoria: "Género" },
    { comum: "Órix-austral", cientifico: "Oryx gazella", categoria: "Espécie" },
    { comum: "Onça", cientifico: "Panthera onca", categoria: "Espécie" },
    { comum: "Orca", cientifico: "Orcinus orca", categoria: "Espécie" },
    { comum: "Ostra", cientifico: "Ostreidae", categoria: "Família" },
    { comum: "Palanca-negra", cientifico: "Hippotragus niger", categoria: "Espécie" },
    { comum: "Papagaio", cientifico: "Psittaciformes", categoria: "Ordem" },
    { comum: "Pardal-comum", cientifico: "Passer domesticus", categoria: "Espécie" },
    { comum: "Pargo", cientifico: "Pagrus", categoria: "Género" },
    { comum: "Pato", cientifico: "Anatidae", categoria: "Família" },
    { comum: "Pavão", cientifico: "Pavo", categoria: "Género" },
    { comum: "Peixe", cientifico: "Actinopterygii", categoria: "Superclasse" },
    { comum: "Peixe/pescado", cientifico: "", categoria: "sem categoria taxonómica" },
    { comum: "Pelicano", cientifico: "Pelecanus", categoria: "Género" },
    { comum: "Perdiz", cientifico: "Alectoris rufa", categoria: "Espécie" },
    { comum: "Peru", cientifico: "Meleagris", categoria: "Género" },
    { comum: "Pescada", cientifico: "Merluccius", categoria: "Género" },
    { comum: "Piolho", cientifico: "Psocodea", categoria: "Ordem" },
    { comum: "Polvo", cientifico: "Octopus vulgaris", categoria: "Espécie" },
    { comum: "Pomba/Pombo", cientifico: "Columba livia", categoria: "Espécie" },
    { comum: "Porco/Porca/Marrã", cientifico: "Sus domesticus", categoria: "Espécie" },
    { comum: "Pulga", cientifico: "Pulicidae", categoria: "Família" },
    { comum: "Puma", cientifico: "Puma concolor", categoria: "Espécie" },
    { comum: "Rã", cientifico: "Ranidae", categoria: "Família" },
    { comum: "Rã-verde", cientifico: "Pelophylax perezi", categoria: "Espécie" },
    { comum: "Raia", cientifico: "Dasyatidae", categoria: "Família" },
    { comum: "Raposa", cientifico: "Vulpes vulpes", categoria: "Espécie" },
    { comum: "Ratazana", cientifico: "Rattus norvegicus", categoria: "Espécie" },
    { comum: "Rato", cientifico: "Rodentia", categoria: "Ordem" },
    { comum: "Rela", cientifico: "Hyla", categoria: "Género" },
    { comum: "Rinoceronte", cientifico: "Rhinocerotidae", categoria: "Família" },
    { comum: "Ruivo", cientifico: "Trigla", categoria: "Género" },
    { comum: "Sapo", cientifico: "Anura", categoria: "Ordem" },
    { comum: "Sardinha", cientifico: "Sardina pilchardus", categoria: "Espécie" },
    { comum: "Sardinha arenque", cientifico: "Clupeidae", categoria: "Família" },
    { comum: "Sável", cientifico: "Alosa alosa", categoria: "Espécie" },
    { comum: "Serpente", cientifico: "Serpentes", categoria: "Subordem" },
    { comum: "Solha", cientifico: "Pleuronectiformes", categoria: "Ordem" },
    { comum: "Tamanduá-mirim", cientifico: "Tamandua tetradactyla", categoria: "Espécie" },
    { comum: "Tartaruga", cientifico: "Testudines", categoria: "Ordem" },
    { comum: "Tigre", cientifico: "Panthera tigris", categoria: "Espécie" },
    { comum: "Toupeira", cientifico: "Talpidae", categoria: "Família" },
    { comum: "Traça", cientifico: "Lepidoptera", categoria: "Ordem" },
    { comum: "Tubarão", cientifico: "Elasmobranchii", categoria: "Subclasse" },
    { comum: "Tubarão-anequim", cientifico: "Isurus oxyrinchus", categoria: "Espécie" },
    { comum: "Tubarão-baleia", cientifico: "Rhincodon typus", categoria: "Espécie" },
    { comum: "Tubarão-raposo", cientifico: "Alopias vulpinus", categoria: "Espécie" },
    { comum: "Urso", cientifico: "Ursus", categoria: "Género" },
    { comum: "Urso-polar", cientifico: "Ursus maritimus", categoria: "Espécie" },
    { comum: "Urso-preguiça", cientifico: "Melursus ursinus", categoria: "Espécie" },
    { comum: "Vaca", cientifico: "Bos taurus", categoria: "Espécie" },
    { comum: "Vespa", cientifico: "Apocrita", categoria: "Subordem" },
    { comum: "Vieira", cientifico: "Pectinida", categoria: "Ordem" },
    { comum: "Zebra", cientifico: "Equus", categoria: "Género" },
    { comum: "Zebra-comum", cientifico: "Equus quagga", categoria: "Espécie" },
    { comum: "Zebu", cientifico: "Bos indicus", categoria: "Espécie" },
    { comum: "Zebro", cientifico: "Equus hydruntinus", categoria: "Espécie" }
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
function normalizarTextoTaxonomico(valor = '') {
    return String(valor)
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

export function obterDadosTaxonomicos(nomeComumSelecionado) {
    if (!nomeComumSelecionado || typeof nomeComumSelecionado !== 'string') {
        return {
            cientifico: 'Não identificado',
            categoria: 'Não identificada'
        };
    }

    const termoBusca = normalizarTextoTaxonomico(nomeComumSelecionado);

    const entrada = TAXONOMIA_ANIMALX.find((animal) => {
        const alternativas = String(animal.comum)
            .split('/')
            .map((valor) => normalizarTextoTaxonomico(valor))
            .filter(Boolean);

        return alternativas.some((alternativa) => {
            return (
                alternativa === termoBusca ||
                termoBusca.includes(alternativa) ||
                alternativa.includes(termoBusca)
            );
        });
    });

    if (entrada) {
        return {
            cientifico: entrada.cientifico,
            categoria: entrada.categoria
        };
    }

    return {
        cientifico: 'Não identificado',
        categoria: 'Não identificada'
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