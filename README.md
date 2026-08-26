# TAG ANIMALx: Arquitetura, Engenharia de Dados e Documentação Metodológica



Repositório oficial de documentação técnica, estruturação de dados e código-fonte do projeto Tag ANIMALx, desenvolvido no âmbito da componente não-letiva do Mestrado em Curadoria e Humanidades Digitais (NOVA FCSH).

O Tag ANIMALx materializa-se numa interface gamificada de Ciência Cidadã, desenhada para atuar sobre um repositório institucional Omeka S. A plataforma convida a comunidade a agir como investigadores, promovendo a identificação, classificação e contextualização de representações de animais no acervo do Museu de Lisboa.

Afastando-se dos modelos tradicionais de submissão passiva de metadados, este projeto implementa uma arquitetura de curadoria distribuída (*crowdsourcing*), suportada por uma interface gamificada, ontologias semânticas estritas e um sistema rigoroso de dupla validação (revisão por pares múltipla).

---

## I. Arquitetura de Software e Infraestrutura Serverless



Para salvaguardar a integridade as credenciais de acesso API associada ao servidor com que interage, o projeto adotou uma arquitetura web desacoplada (*Decoupled Architecture*) baseada em soluções Serverless.

* **Isolamento do Frontend:** A interface pública construída em HTML5, CSS3 e Vanilla JavaScript (`index.html`, `animalx.css`, `navigation.js`) opera exclusivamente no navegador do utilizador, não contendo qualquer chave de API ou credencial sensível.


* **Gestão de Credenciais (Cofre Digital):** As chaves de administrador do Omeka S (`KEY_IDENTITY` e `KEY_CREDENTIAL`) são armazenadas remotamente em Variáveis de Ambiente através da plataforma Netlify.


* **Ocultação no Repositório:** A estrutura do projeto utiliza o ficheiro `.gitignore` para bloquear explicitamente a partilha de ficheiros de configuração locais e ficheiros ocultos do sistema operativo, prevenindo a exposição de dados sensíveis no GitHub.


* **Comunicação via Funções Intermédias:** As chamadas à REST API do Omeka S são mediadas pelo diretório `netlify/functions/`.


* **Pedidos Seguros:** O frontend emite pedidos simples em JSON para as funções Serverless (ex: `/.netlify/functions/criar-rascunho`), que, por sua vez, constroem o payload JSON-LD final, assinam-no criptograficamente e submetem os dados (`POST`, `PATCH`) ao servidor do Omeka S.



---

## II. Modelação de Dados e Ontologias Semânticas



A consistência curatorial e a interoperabilidade a longo prazo são asseguradas pela adoção da filosofia de Dados Abertos Interligados (*Linked Open Data*), fundindo e mapeando vocabulários controlados nativos do Omeka S.

* **Mapeamento Numérico Direto:** A comunicação com o Omeka S obriga à declaração exata do `property_id` numérico de cada campo para evitar que a base de dados descarte a informação.


* **Integração Dublin Core:** Os dados contextuais utilizam a ontologia padrão, incluindo, por exemplo, a designação do animal (`dcterms:title`), tipologia (`dcterms:type`, ID 8), descrição (`dcterms:description`), e referência cruzada de itens relacionados (`dcterms:relation`).


* **Integração Darwin Core:** A normalização zoológica é regida por vocabulários científicos, injetando o nome científico (`dwc:scientificName`, ID 419), a categoria taxonómica (`dwc:taxonRank`) e a quantidade de representações da mesma espécie (`dwc:organismScope`).


* **Taxonomia Dinâmica:** Uma função de backend interseta o nome comum do animal, preenchida pelo utilizador com um dicionário estático alinhado pelo ITIS (Sistema Integrado de Informação Taxonómica), traduzindo-o em nomenclatura científica precisa para a obtenção do nome científico e categoria taxonómica do animal identificado.


* **Associação a Modelos de Recursos:** Os novos itens criados através de validação múltipla são forçados a herdar o Modelo de Recursos oficial, assegurando a correta formatação dos campos de curadoria no painel administrativo.



---

## III. Interface, Experiência de Utilizador e Gamificação



A interface visa reduzir a carga cognitiva do voluntário, transformando a análise científica num processo lúdico e gratificante.

* **Formulário Progressivo (Wizard):** O formulário divide a análise em seis passos modulares (Perguntas 1 a 6) através da manipulação do Modelo de Objeto de Documentos (DOM) em JavaScript.


* **Integração Visual IIIF:** O layout em grelha assenta num painel fixo de visualização que integra a biblioteca OpenSeadragon (via CDN), garantindo exploração de alta resolução através de Manifestos IIIF.


* **Caderno de Campo Interativo:** O dashboard pessoal do voluntário assume a estética de um diário científico, permitindo ao utilizador acompanhar o seu progresso ao longo da iniciativa.


* **Monitorização de Acervo:** O sistema lê os identificadores dos itens submetidos e gera barras de progresso matemático associadas a coleções museológicas específicas (Azulejaria, Cerâmica, Escultura, Desenho, Pintura e Gravura).


* **Contagem de Espécimes:** A lógica de software salvaguarda cada animal individual validado (variável `animaisIdentificados`), reportando-o no Caderno de Campo.



### Lógica Exponencial e Duplicação Taxonómica



* **Registos Nulos:** Em registos onde não se encontra uma representação animal, a interface remete para a sua submissão logo na pergunta 1, não avançando para o restante formulário.


* **Iteração Zoológica:** Se o utilizador assinalar a presença de outras espécies na mesma obra, a interface preserva a imagem de base e limpa apenas as variáveis das perguntas 2 a 6 (`limparCamposP2aP6`), criando múltiplas entradas no banco de dados.



### Economia Algorítmica de Créditos (Pontuação)



O motor de gamificação atribui valores de mérito ponderados pelo esforço:

* **Triagem Negativa:** 10 pontos por assinalar que a representação atual não contém elementos da fauna (limpeza de base de dados).


* **Validação Base:** 15 pontos pelo mapeamento obrigatório de identificação do animal, da quantidade de animais da mesma espécie e da tipologia associada à sua representação contextual.


* **Enriquecimento Qualitativo:** 10 pontos de bónus por submissão da descrição qualitativa da representação animal.


* **Multiplicador Exponencial:** A pontuação acumulada é duplicada matematicamente a cada nova espécie identificada no mesmo item, gerando um incentivo à observação do utilizador.



A conversão destes pontos traduz-se numa progressão académica refletida através da injeção dinâmica de selos e títulos nas modais da interface: *Curador Estagiário* (0+ pontos), *Investigador Assistente* (100+ pontos), *Historiador Especialista* (400+ pontos) e *Curador Catedrático* (1000+ pontos).

---

## IV. Fluxo Curatorial e Regra de Validação Múltipla



A arquitetura de dados garante a mitigação de erros estatísticos do crowdsourcing através de um mecanismo de quarentena.

* **Anotações Silenciosas e Agrupadas:** Em vez de modificar metadados públicos, as respostas de cada utilizador são empacotadas num bloco JSON e inscritas como metadado privado (`bibo:annotates`) num item provisório.


* **Agrupamento Inteligente:** O sistema de backend verifica primeiramente através da API se já existe uma cópia do item com o campo `dcterms:isReferencedBy` a apontar para a obra original.


* **Ação Condicional:** Se a cópia existir, executa um pedido `PATCH` para acrescentar o novo voto comunitário ao histórico do mesmo item. Se não existir, gera um pedido `POST` criando um contentor e clonando a multimédia associada.


* **A Validação por Múltiplos Utilizadores:** Um script cronológico avalia o número de entradas no histórico (através da leitura da array originada na propriedade de anotações).


* **Automação de Transição:** Ao reunir cinco avaliações independentes, o sistema procede à transição do Item Set, enviando o registo para o painel de curadoria restrito para revisão pela equipa do projeto, sendo posteriormente agregado à coleção de itens analisados.



---

## V. Privacidade e Ética de Dados



O desenho técnico da plataforma obedece estritamente ao Regulamento Geral sobre a Proteção de Dados (RGPD).

* **Princípio da Minimização:** O formulário recolhe estritamente as variáveis exigidas para o reconhecimento de autoria investigativa (Primeiro e Último Nome).


* **Mecânica de Autorização:** A interface apresenta bloqueios funcionais (`abrirModalConsentimento()`), impedindo a progressão do fluxo caso a caixa de validação dos Termos de Consentimento e Privacidade não seja ativada após leitura da Nota de Privacidade em PDF.


* **Armazenamento Volátil:** A interface abdica de cookies rastreáveis.


* **Limpeza Local:** Toda a gestão mecânica de gamificação e sessão é mantida na cache temporal do navegador (`localStorage` e `sessionStorage`), sendo totalmente destruída pela invocação do comando `localStorage.removeItem('animalx_progresso')` mediante clique na opção de "Terminar Sessão".



---


# TAG ANIMALx: Architecture, Data Engineering, and Methodological Documentation

Official repository for technical documentation, data structuring, and source code of the Tag ANIMALx project, developed as part of the non-teaching component of the Master's in Curation and Digital Humanities (NOVA FCSH).

Tag ANIMALx materializes as a gamified Citizen Science interface, designed to operate over an Omeka S institutional repository. The platform invites the community to act as researchers, promoting the identification, classification, and contextualization of animal representations in the Museum of Lisbon's collection.

Moving away from traditional models of passive metadata submission, this project implements a distributed curation architecture (*crowdsourcing*), supported by a gamified interface, strict semantic ontologies, and a rigorous double validation system (multiple peer review).

---

## I. Software Architecture and Serverless Infrastructure

To safeguard the integrity of the API access credentials associated with the server it interacts with, the project adopted a Decoupled Architecture based on Serverless solutions.

* **Frontend Isolation:** The public interface built in HTML5, CSS3, and Vanilla JavaScript (`index.html`, `animalx.css`, `api.js`, `app.js`) operates exclusively in the user's browser, containing no API keys or sensitive credentials.


* **Credential Management (Digital Vault):** The Omeka S administrator keys (`KEY_IDENTITY` and `KEY_CREDENTIAL`) are stored remotely in Environment Variables via the Netlify platform.


* **Repository Concealment:** The project structure uses the `.gitignore` file to explicitly block the sharing of local configuration files and hidden operating system files, preventing the exposure of sensitive data on GitHub.
* **Communication via Intermediary Functions:** Calls to the Omeka S REST API are mediated by the `netlify/functions/` directory.


* **Secure Requests:** The frontend issues simple JSON requests to the Serverless functions (e.g., `/.netlify/functions/criar-rascunho`), which, in turn, construct the final JSON-LD payload, cryptographically sign it, and submit the data (`POST`, `PATCH`) to the Omeka S server.



---

## II. Data Modeling and Semantic Ontologies

Curatorial consistency and long-term interoperability are ensured by adopting the Linked Open Data philosophy, merging and mapping native Omeka S controlled vocabularies.

* **Direct Numeric Mapping:** Communication with Omeka S requires the exact declaration of the numeric `property_id` of each field to prevent the database from discarding the information.


* **Dublin Core Integration:** Contextual data uses the standard ontology, including, for example, the animal designation (`dcterms:title`), typology (`dcterms:type`, ID 8), description (`dcterms:description`), and cross-reference of related items (`dcterms:relation`).


* **Darwin Core Integration:** Zoological normalization is governed by scientific vocabularies, injecting the scientific name (`dwc:scientificName`, ID 419), the taxonomic category (`dwc:taxonRank`, ID 439), and the quantity of representations of the same species (`dwc:organismScope`, ID 372).


* **Dynamic Taxonomy:** A backend function intersects the animal's common name, filled in by the user, with a static dictionary aligned by the ITIS (Integrated Taxonomic Information System) (`nomes_itis.csv`), translating it into precise scientific nomenclature to obtain the scientific name and taxonomic category of the identified animal.


* **Association with Resource Templates:** The new items created through multiple validation are forced to inherit the official Resource Template (`o:resource_template`), ensuring the correct formatting of curatorial fields in the administrative panel.



---

## III. Interface, User Experience, and Gamification

The interface aims to reduce the volunteer's cognitive load, transforming scientific analysis into a playful and rewarding process.

* **Progressive Form (Wizard):** The form divides the analysis into six modular steps (Questions 1 to 6) through the manipulation of the Document Object Model (DOM) in JavaScript.


* **IIIF Visual Integration:** The grid layout is based on a fixed visualization panel that integrates the OpenSeadragon library (via CDN), ensuring high-resolution exploration through IIIF Manifests.


* **Interactive Field Notebook:** The volunteer's personal dashboard assumes the aesthetics of a scientific diary, allowing the user to track their progress throughout the initiative.
* **Collection Monitoring:** The system reads the identifiers of the submitted items and generates mathematical progress bars associated with specific museum collections (Tiles, Ceramics, Sculpture, Drawing, Painting, and Engraving).
* **Specimen Counting:** The software logic safeguards each individually validated animal (variable `animaisIdentificados`), reporting it in the Field Notebook.

### Exponential Logic and Taxonomic Duplication

* **Null Records:** In records where no animal representation is found, the interface prompts for its submission right at question 1, not advancing to the rest of the form.
* **Zoological Iteration:** If the user indicates the presence of other species in the same artwork, the interface preserves the base image and clears only the variables for questions 2 to 6 (`limparCamposP2aP6`), creating multiple entries in the database.



### Algorithmic Credit Economy (Scoring)

The gamification engine assigns merit values weighted by effort:

* **Negative Triage:** 10 points for indicating that the current representation does not contain fauna elements (database cleaning).
* **Base Validation:** 15 points for the mandatory mapping of the animal identification, the quantity of animals of the same species, and the typology associated with its contextual representation.
* **Qualitative Enrichment:** 10 bonus points for submitting the qualitative description of the animal representation.
* **Exponential Multiplier:** The accumulated score is mathematically duplicated for each new species identified in the same item, generating an incentive for user observation.

The conversion of these points translates into academic progression reflected through the dynamic injection of seals and titles in the interface modals: *Intern Curator* (0+ points), *Assistant Researcher* (100+ points), *Specialist Historian* (400+ points), and *Full Curator* (1000+ points).

---

## IV. Curatorial Flow and Multiple Validation Rule

The data architecture ensures the mitigation of statistical crowdsourcing errors through a quarantine mechanism.

* **Silent and Grouped Annotations:** Instead of modifying public metadata, each user's responses are packaged into a JSON block and inscribed as private metadata (`bibo:annotates`) in a provisional item.


* **Smart Grouping:** The backend system first verifies through the API if a copy of the item already exists with the `dcterms:isReferencedBy` field pointing to the original artwork.


* **Conditional Action:** If the copy exists, it executes a `PATCH` request to add the new community vote to the history of the same item. If it does not exist, it generates a `POST` request creating a container and cloning the associated media.


* **The Multi-peer Validation:** A chronological script evaluates the number of entries in the history (by reading the array originated in the annotations property).
* **Transition Automation:** Upon gathering five independent evaluations, the system proceeds to transition the Item Set, sending the record to the restricted curation panel for review by the project team, subsequently aggregating it into the collection of analyzed items.

---

## V. Privacy and Data Ethics

The technical design of the platform strictly complies with the General Data Protection Regulation (GDPR).

* **Minimization Principle:** The form strictly collects the variables required for investigative authorship recognition (First and Last Name).
* **Authorization Mechanics:** The interface presents functional locks (`abrirModalConsentimento()`), preventing progression in the flow if the Consent and Privacy Terms validation box is not activated after reading the Privacy Notice in PDF.
* **Volatile Storage:** The interface forgoes trackable cookies.
* **Local Clearing:** All mechanical gamification and session management is kept in the browser's temporary cache (`localStorage` and `sessionStorage`), being completely destroyed by invoking the command `localStorage.removeItem('animalx_progresso')` upon clicking the "End Session" option.
