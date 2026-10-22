"use strict";

export class View {
    constructor() {
        this.gridContainer = document.querySelector('[data-grid-board]');
        this.inputDimension = document.querySelector('[data-setting="dimension"]');
        this.inputTamano = document.querySelector('[data-setting="tamano"]');
        this.inputAspecto = document.querySelector('[data-setting="aspecto"]');
        this.botonesNuevoJuego = document.querySelectorAll('[data-action="nuevo-juego"]');
        this.btnAyuda = document.querySelector('[data-action="mostrar-ayuda"]');
        this.btnCerrarAyuda = document.querySelector('[data-action="cerrar-ayuda"]');
        this.modalAyuda = document.querySelector('[data-modal="ayuda"]');
        this.modalVictoria = document.querySelector('[data-modal="victoria"]');
        this.spanMovimientos = document.querySelector('[data-bind="movimientos"]');
        this.spanVictoriaMovimientos = document.querySelector('[data-bind="victoria-movimientos"]');

        // Geometría vectorial SVG limpia para cada tipo según el tema visual
        this.formasSvg = {
            geometrico: {
                0: '<circle cx="50" cy="50" r="45" />',
                1: '<rect x="8" y="8" width="84" height="84" rx="6" />',
                2: '<polygon points="50,5 95,92 5,92" />'
            },
            naipes: {
                0: '<path d="M50 5 C42.5 18 12.5 37 12.5 54.5 C12.5 70.75 31.25 78.25 45 64.5 C47.5 62 48.75 58.25 50 54.5 C51.25 58.25 52.5 62 55 64.5 C68.75 78.25 87.5 70.75 87.5 54.5 C87.5 37 57.5 18 50 5 Z M46.25 53.25 C46.25 65.75 45 75.75 40 83.25 C37.5 87 33.75 88.25 30 88.25 L30 95.75 L70 95.75 L70 88.25 C66.25 88.25 62.5 87 60 83.25 C55 75.75 53.75 65.75 53.75 53.25 C52.5 53.25 51.25 54.5 50 54.5 C48.75 53.25 47.5 53.25 46.25 53.25 Z" />', // Pica
                1: '<path d="M50 95 C36.154 81.154 8.462 60.385 8.462 36.846 C8.462 11.923 38.923 5 50 30.154 C61.077 5 91.538 11.923 91.538 36.846 C91.538 60.385 63.846 81.154 50 95 Z" />', // Corazón
                2: '<polygon points="50,5 87.5,50 50,95 12.5,50" />' // Diamante
            }
        };
    }

    sincronizarControles(estado) {
        this.inputDimension.value = estado.dimension;
        this.inputTamano.value = estado.tamanoFichas;
        this.inputAspecto.value = estado.aspectoFichas;
    }

    renderizarTablero(tablero, config) {
        const { dimension, tamanoFichas, aspectoFichas, juegoTerminado } = config;

        this.gridContainer.innerHTML = '';
        this.gridContainer.style.setProperty('--n-cols', dimension);
        this.gridContainer.style.gridTemplateColumns = `repeat(${dimension}, 1fr)`;
        this.gridContainer.style.gridTemplateRows = `repeat(${dimension}, 1fr)`;

        const conjuntoActual = this.formasSvg[aspectoFichas] || this.formasSvg.geometrico;

        tablero.forEach((fila, fIndex) => {
            fila.forEach((tipoFicha, cIndex) => {
                const celda = document.createElement('div');
                celda.className = 'tablero-celda';
                celda.dataset.fila = fIndex;
                celda.dataset.columna = cIndex;
                celda.dataset.cellContainer = '';

                const ficha = document.createElement('div');
                ficha.className = `ficha ficha-tipo-${tipoFicha} ficha--${tamanoFichas}`;
                ficha.setAttribute('draggable', !juegoTerminado);
                ficha.dataset.draggableItem = '';
                ficha.dataset.fila = fIndex;
                ficha.dataset.columna = cIndex;
                ficha.dataset.tipo = tipoFicha;

                // Contenido SVG vectorial correspondiente a este tipo de ficha
                const contenidoSvg = conjuntoActual[tipoFicha] || conjuntoActual[0];
                ficha.innerHTML = `
                    <svg class="ficha__svg" viewBox="0 0 100 100" aria-hidden="true">
                        ${contenidoSvg}
                    </svg>
                `;

                celda.appendChild(ficha);
                this.gridContainer.appendChild(celda);
            });
        });
    }

    actualizarEstadisticas(movimientos, juegoTerminado) {
        this.spanMovimientos.textContent = movimientos;
        if (juegoTerminado) {
            this.spanVictoriaMovimientos.textContent = movimientos;
            this.modalVictoria.showModal();
        } else if (this.modalVictoria.open) {
            this.modalVictoria.close();
        }
    }

    toggleModalAyuda(mostrar) {
        if (mostrar) this.modalAyuda.showModal();
        else this.modalAyuda.close();
    }

    bindNuevoJuego(handler) {
        this.botonesNuevoJuego.forEach((btn) => {
            btn.addEventListener('click', () => {
                if (this.modalVictoria.open) {
                    this.modalVictoria.close();
                }
                handler();
            });
        });
    }

    bindCambioDimension(handler) {
        this.inputDimension.addEventListener('change', (e) => {
            const val = parseInt(e.target.value, 10);
            if (val >= 3) {
                handler(val);
            } else {
                e.target.value = 3;
                handler(3);
            }
        });
    }

    bindCambioTamano(handler) {
        this.inputTamano.addEventListener('change', (e) => handler(e.target.value));
    }

    bindCambioAspecto(handler) {
        this.inputAspecto.addEventListener('change', (e) => handler(e.target.value));
    }

    bindMostrarAyuda() {
        this.btnAyuda.addEventListener('click', () => this.toggleModalAyuda(true));
        this.btnCerrarAyuda.addEventListener('click', () => this.toggleModalAyuda(false));
    }

    bindDragAndDrop(onDrop) {
        this.gridContainer.addEventListener('dragstart', (e) => {
            const ficha = e.target.closest('[data-draggable-item]');
            if (!ficha) return;

            const datosOrigen = {
                fila: parseInt(ficha.dataset.fila, 10),
                col: parseInt(ficha.dataset.columna, 10)
            };
            e.dataTransfer.setData('application/json', JSON.stringify(datosOrigen));
            e.dataTransfer.effectAllowed = 'move';

            ficha.classList.add('elemento-en-arrastre');
        });

        this.gridContainer.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        });

        this.gridContainer.addEventListener('dragenter', (e) => {
            const celda = e.target.closest('[data-cell-container]');
            if (celda) celda.classList.add('elemento-en-sobrevuelo');
        });

        this.gridContainer.addEventListener('dragleave', (e) => {
            const celda = e.target.closest('[data-cell-container]');
            if (celda) celda.classList.remove('elemento-en-sobrevuelo');
        });

        this.gridContainer.addEventListener('drop', (e) => {
            e.preventDefault();
            const celdaDestino = e.target.closest('[data-cell-container]');
            if (!celdaDestino) return;

            celdaDestino.classList.remove('elemento-en-sobrevuelo');
            const datosOrigenJSON = e.dataTransfer.getData('application/json');
            if (!datosOrigenJSON) return;

            const origen = JSON.parse(datosOrigenJSON);
            const destino = {
                fila: parseInt(celdaDestino.dataset.fila, 10),
                col: parseInt(celdaDestino.dataset.columna, 10)
            };

            if (onDrop) onDrop(origen, destino);
        });

        this.gridContainer.addEventListener('dragend', (e) => {
            const ficha = e.target.closest('[data-draggable-item]');
            if (ficha) ficha.classList.remove('elemento-en-arrastre');
        });
    }
}