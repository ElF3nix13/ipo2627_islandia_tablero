"use strict";

export class Model {
    constructor() {
        this.dimension = 3;
        this.tamanoFichas = 'mediana';
        this.formaFichas = 'circulo';
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
        // 1. Definir qué tipo tendrá cada fila en la solución final
        // Garantizamos que los 3 tipos (0, 1, 2) aparezcan al menos una vez cuando N >= 3
        const tiposPorFila = [];
        for (let i = 0; i < n; i++) {
            if (i < 3) {
                tiposPorFila.push(i); // Asegura tipos 0, 1 y 2
            } else {
                tiposPorFila.push(Math.floor(Math.random() * 3)); // Reparto para filas restantes
            }
        }

        // 2. Crear la bolsa con exactamente las fichas necesarias (múltiplos de N)
        const bolsaFichas = [];
        for (let i = 0; i < n; i++) {
            const tipoFila = tiposPorFila[i];
            for (let j = 0; j < n; j++) {
                bolsaFichas.push(tipoFila);
            }
        }

        // 3. Barajar aleatoriamente la bolsa (Fisher-Yates shuffle)
        let matriz = [];
        let esVictoria = true;

        while (esVictoria) {
            // Algoritmo Fisher-Yates
            for (let i = bolsaFichas.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                const temp = bolsaFichas[i];
                bolsaFichas[i] = bolsaFichas[j];
                bolsaFichas[j] = temp;
            }

            // Reconstruir la matriz NxN
            matriz = [];
            for (let i = 0; i < n; i++) {
                matriz.push(bolsaFichas.slice(i * n, (i + 1) * n));
            }

            // Comprobar que no empiece ya resuelto
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

    setFormaFichas(forma) {
        if (forma !== this.formaFichas) {
            this.formaFichas = forma;
            this.iniciarNuevaPartida(this.dimension);
            return true;
        }
        return false;
    }

    getEstado() {
        return {
            dimension: this.dimension,
            tamanoFichas: this.tamanoFichas,
            formaFichas: this.formaFichas,
            tablero: this.tablero,
            movimientos: this.movimientos,
            juegoTerminado: this.juegoTerminado
        };
    }
}