// js/gamification.js

// 1. CONFIGURAÇÕES DO JOGO (MATEMÁTICA)
export const animalxConfig = {
    pontos: {
        registo_sem_animal: 10,
        base_identificacao: 15,
        bonus_descricao: 10,
        multiplicador_especie_extra: 2
    },
    // NOVO: Dicionário de siglas para as coleções
    colecoes: {
        'AZU': 'azulejaria',
        'CER': 'ceramica',
        'PIN': 'pintura',
        'GRA': 'gravura',
        'ESC': 'escultura',
        'DES': 'desenho'
    },
    niveis: [
        { titulo: "Curador Estagiário", limite: 0, imagem: "asset/img/selo_nivel1.png" },
        { titulo: "Investigador Assistente", limite: 100, imagem: "asset/img/selo_nivel2.png" },
        { titulo: "Historiador Especialista", limite: 400, imagem: "asset/img/selo_nivel3.png" },
        { titulo: "Curador Catedrático", limite: 1000, imagem: "asset/img/selo_nivel4.png" }
    ]
};

// 2. GESTOR DE ESTADO (LOCALSTORAGE)
export const GestorGamificacao = {
    chaveMemoria: 'animalx_progresso',

    carregarProgresso: function() {
        const dadosGuardados = localStorage.getItem(this.chaveMemoria);
        if (dadosGuardados) return JSON.parse(dadosGuardados);
        
        return {
            pontos: 0,
            animaisIdentificados: 0,
            registosAnalisados: 0,
            colecoes: { azulejaria: 0, ceramica: 0, escultura: 0 }
        };
    },

    guardarProgresso: function(dados) {
        localStorage.setItem(this.chaveMemoria, JSON.stringify(dados));
    },

    obterNivelAtual: function(pontosTotais) {
        const niveisInvertidos = [...animalxConfig.niveis].reverse();
        for (let nivel of niveisInvertidos) {
            if (pontosTotais >= nivel.limite) return nivel;
        }
        return animalxConfig.niveis[0];
    },

registarSubmissao(teveAnimal, teveDescricao, multiplicadorEspecie, colecaoSubmetida, itemId = null) {
        
        let pontosGanhos = 0;
        let progresso = this.carregarProgresso(); // Carrega o progresso logo aqui
        
        // 1. CALCULAR PONTOS E SOMAR ANIMAIS
        if (!teveAnimal) {
            pontosGanhos = 10; // Triagem Negativa
        } else {
            pontosGanhos = 15; // Identificação Base
            if (teveDescricao) {
                pontosGanhos += 10; // Bónus de Descrição
            }
            
            // ==========================================
            // A LINHA RESTAURADA: Soma +1 Animal Identificado!
            // ==========================================
            progresso.animaisIdentificados = (progresso.animaisIdentificados || 0) + 1;
        }

        // Aplica a duplicação se for espécie extra (O "Combo")
        if (multiplicadorEspecie > 0) {
            pontosGanhos = pontosGanhos * (2 ** multiplicadorEspecie); 
        }

        // 2. ATUALIZAR A MEMÓRIA DO JOGADOR
        // O utilizador ganha SEMPRE os pontos pelo esforço
        progresso.pontos += pontosGanhos;

        // 3. VERIFICAÇÃO DE ID: Este item já subiu a barra de coleção nesta sessão?
        if (!progresso.idsItensTratados) {
            progresso.idsItensTratados = []; // Cria a lista de memória se não existir
        }

        let itemJaFoiContado = false;
        if (itemId) {
            if (progresso.idsItensTratados.includes(itemId)) {
                itemJaFoiContado = true; // Já vimos este item
            } else {
                progresso.idsItensTratados.push(itemId); // Memoriza o item novo
            }
        }

        // 4. ESTATÍSTICAS: Só soma +1 nas coleções se o item for novo!
        if (!itemJaFoiContado) {
            progresso.registosAnalisados = (progresso.registosAnalisados || 0) + 1;
            
            if (colecaoSubmetida) {
                if (!progresso.colecoes) progresso.colecoes = {};
                if (progresso.colecoes[colecaoSubmetida] === undefined) {
                    progresso.colecoes[colecaoSubmetida] = 0;
                }
                
                // Soma +1 ao registo tratado daquela tipologia
                progresso.colecoes[colecaoSubmetida] += 1;
            }
        }

        // 5. GUARDAR E VERIFICAR CARREIRA
        this.guardarProgresso(progresso);
        let nivelNovo = this.obterNivelAtual(progresso.pontos);
        let subiuDeNivel = false;

        if (progresso.nivelAtual !== nivelNovo.titulo) {
            progresso.nivelAtual = nivelNovo.titulo;
            this.guardarProgresso(progresso);
            subiuDeNivel = true;
        }

        return {
            pontosGanhos: pontosGanhos,
            totalPontos: progresso.pontos,
            nivelAtual: nivelNovo,
            subiuDeNivel: subiuDeNivel
        };
    }
};

// Se precisares de aceder diretamente via consola para testes:
window.GestorGamificacao = GestorGamificacao;