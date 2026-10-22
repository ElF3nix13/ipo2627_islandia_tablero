"use strict";

export class Model {
    constructor() {
        this.dimension = 4;
        this.tamanoFichas = 'mediana';
        this.aspectoFichas = 'geometrico';
        this.paletaColores = 'primaria';
        this.tablero = [];
        this.movimientos = 0;
        this.juegoTerminado = false;
    }

    iniciarNuevaPartida(n = this.dimension) {
        const num = parseInt(n, 10);
        this.dimension = isNaN(num) || num < 3 ? 3 : num;
        this.movimientos = 0;
        this.juegoTerminado = false;
        this.tablero = this.generarTableroResoluble(this.dimension);
    }

    generarTableroResoluble(n) {
        // 1. Asignar el tipo de ficha para cada fila final (0, 1 o 2)
        // Se asegura que los 3 tipos aparezcan al menos una vez al ser N >= 3
        const tiposPorFila = [];
        for (let i = 0; i < n; i++) {
            if (i < 3) {
                tiposPorFila.push(i);
            } else {
                tiposPorFila.push(Math.floor(Math.random() * 3));
            }
        }

        // 2. Llenar la bolsa con múltiplos exactos de N para cada tipo
        const bolsaFichas = [];
        for (let i = 0; i < n; i++) {
            const tipoFila = tiposPorFila[i];
            for (let j = 0; j < n; j++) {
                bolsaFichas.push(tipoFila);
            }
        }

        // 3. Barajar aleatoriamente mediante Fisher-Yates
        let matriz = [];
        let esVictoria = true;

        while (esVictoria) {
            for (let i = bolsaFichas.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                const temp = bolsaFichas[i];
                bolsaFichas[i] = bolsaFichas[j];
                bolsaFichas[j] = temp;
            }

            matriz = [];
            for (let i = 0; i < n; i++) {
                matriz.push(bolsaFichas.slice(i * n, (i + 1) * n));
            }

            esVictoria = this.comprobarVictoriaMatriz(matriz);
        }

        return matriz;
    }

    intercambiarFichas(pos1, pos2) {
        const { fila: f1, col: c1 } = pos1;
        const { fila: f2, col: c2 } = pos2;

        if (f1 === f2 && c1 === c2) return false;

        const temp = this.tablero[f1][c1];
        this.tablero[f1][c1] = this.tablero[f2][c2];
        this.tablero[f2][c2] = temp;

        this.movimientos++;
        this.juegoTerminado = this.comprobarVictoria();
        return true;
    }

    comprobarVictoria() {
        return this.comprobarVictoriaMatriz(this.tablero);
    }

    comprobarVictoriaMatriz(matriz) {
        const n = matriz.length;
        for (let i = 0; i < n; i++) {
            const primerTipo = matriz[i][0];
            for (let j = 1; j < n; j++) {
                if (matriz[i][j] !== primerTipo) return false;
            }
        }
        return true;
    }

    setDimension(n) {
        const num = parseInt(n, 10);
        if (!isNaN(num) && num >= 3 && num !== this.dimension) {
            this.dimension = num;
            this.iniciarNuevaPartida(this.dimension);
            return true;
        }
        return false;
    }

    setTamanoFichas(tamano) {
        if (tamano !== this.tamanoFichas) {
            this.tamanoFichas = tamano;
            this.iniciarNuevaPartida(this.dimension);
            return true;
        }
        return false;
    }

    setAspectoFichas(aspecto) {
        if (aspecto !== this.aspectoFichas) {
            this.aspectoFichas = aspecto;
            this.iniciarNuevaPartida(this.dimension);
            return true;
        }
        return false;
    }

    setPaletaColores(paleta) {
        if (paleta !== this.paletaColores) {
            this.paletaColores = paleta;
            this.iniciarNuevaPartida(this.dimension);
            return true;
        }
        return false;
    }

    getEstado() {
        return {
            dimension: this.dimension,
            tamanoFichas: this.tamanoFichas,
            aspectoFichas: this.aspectoFichas,
            paletaColores: this.paletaColores,
            tablero: this.tablero,
            movimientos: this.movimientos,
            juegoTerminado: this.juegoTerminado
        };
    }
}