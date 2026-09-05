
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


* **A Regra dos 5 Votos:** Um script cronológico avalia o número de entradas no histórico (através da leitura da array originada na propriedade de anotações).


* **Automação de Transição:** Ao reunir cinco avaliações independentes, o sistema procede à transição do Item Set, enviando o registo para o painel de curadoria restrito para revisão pela equipa do projeto, sendo posteriormente agregado à coleção de itens analisados.



---

## V. Privacidade e Ética de Dados



O desenho técnico da plataforma obedece estritamente ao Regulamento Geral sobre a Proteção de Dados (RGPD).

* **Princípio da Minimização:** O formulário recolhe estritamente as variáveis exigidas para o reconhecimento de autoria investigativa (Primeiro e Último Nome).


* **Mecânica de Autorização:** A interface apresenta bloqueios funcionais (`abrirModalConsentimento()`), impedindo a progressão do fluxo caso a caixa de validação dos Termos de Consentimento e Privacidade não seja ativada após leitura da Nota de Privacidade em PDF.


* **Armazenamento Volátil:** A interface abdica de cookies rastreáveis.


* **Limpeza Local:** Toda a gestão mecânica de gamificação e sessão é mantida na cache temporal do navegador (`localStorage` e `sessionStorage`), sendo totalmente destruída pela invocação do comando `localStorage.removeItem('animalx_progresso')` mediante clique na opção de "Terminar Sessão".