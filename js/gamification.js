// js/gamification.js

// 1. CONFIGURAÇÕES DO JOGO (MATEMÁTICA)
export const animalxConfig = {
    pontos: {
        registo_sem_animal: 10,
        base_identificacao: 15,
        bonus_descricao: 10,
        multiplicador_especie_extra: 2
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

    registarSubmissao: function(teveAnimal, teveDescricao, especiesExtras = 0, colecaoSubmetida = null) {
        let progresso = this.carregarProgresso();
        
        // 1. Memoriza o nível ANTES de somar
        let nivelAntigo = this.obterNivelAtual(progresso.pontos);

        let pontosGanhos = 0;
        if (!teveAnimal) {
            pontosGanhos = animalxConfig.pontos.registo_sem_animal;
        } else {
            pontosGanhos = animalxConfig.pontos.base_identificacao;
            if (teveDescricao) pontosGanhos += animalxConfig.pontos.bonus_descricao;
            if (especiesExtras > 0) pontosGanhos *= (animalxConfig.pontos.multiplicador_especie_extra * especiesExtras);
            progresso.animaisIdentificados += (1 + especiesExtras);
        }

        progresso.pontos += pontosGanhos;
        progresso.registosAnalisados += 1;
        if (colecaoSubmetida && progresso.colecoes[colecaoSubmetida] !== undefined) {
            progresso.colecoes[colecaoSubmetida] += 1;
        }

        this.guardarProgresso(progresso);

        // 2. Verifica o nível DEPOIS de somar
        let nivelNovo = this.obterNivelAtual(progresso.pontos);
        
        // 3. O "Gatilho" (Verdadeiro se subiu de patamar)
        let subiuDeNivel = nivelAntigo.limite < nivelNovo.limite;

        return { 
            pontosGanhos, 
            progressoAtual: progresso, 
            nivelAtual: nivelNovo,
            subiuDeNivel // <- Exporta a informação de subida
        };
    }
};

// Se precisares de aceder diretamente via consola para testes:
window.GestorGamificacao = GestorGamificacao;