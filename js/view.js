"use strict";

export class View {
    constructor() {
        this.gridContainer = document.querySelector('[data-grid-board]');
        this.inputDimension = document.querySelector('[data-setting="dimension"]');
        this.inputTamano = document.querySelector('[data-setting="tamano"]');
        this.inputForma = document.querySelector('[data-setting="forma"]');
        this.botonesNuevoJuego = document.querySelectorAll('[data-action="nuevo-juego"]');
        this.btnAyuda = document.querySelector('[data-action="mostrar-ayuda"]');
        this.btnCerrarAyuda = document.querySelector('[data-action="cerrar-ayuda"]');
        this.modalAyuda = document.querySelector('[data-modal="ayuda"]');
        this.modalVictoria = document.querySelector('[data-modal="victoria"]');
        this.spanMovimientos = document.querySelector('[data-bind="movimientos"]');
        this.spanVictoriaMovimientos = document.querySelector('[data-bind="victoria-movimientos"]');
    }

    sincronizarControles(estado) {
        this.inputDimension.value = estado.dimension;
        this.inputTamano.value = estado.tamanoFichas;
        this.inputForma.value = estado.formaFichas;
    }

    renderizarTablero(tablero, config) {
        const { dimension, tamanoFichas, formaFichas, juegoTerminado } = config;
        
        this.gridContainer.innerHTML = '';
        this.gridContainer.style.setProperty('--n-cols', dimension);
        this.gridContainer.style.gridTemplateColumns = `repeat(${dimension}, 1fr)`;
        this.gridContainer.style.gridTemplateRows = `repeat(${dimension}, 1fr)`;

        tablero.forEach((fila, fIndex) => {
            fila.forEach((tipoFicha, cIndex) => {
                const celda = document.createElement('div');
                celda.className = 'tablero-celda';
                celda.dataset.fila = fIndex;
                celda.dataset.columna = cIndex;
                celda.dataset.cellContainer = '';

                const ficha = document.createElement('div');
                ficha.className = `ficha ficha-tipo-${tipoFicha} ficha-${tamanoFichas} ficha-${formaFichas}`;
                ficha.setAttribute('draggable', !juegoTerminado);
                ficha.dataset.draggableItem = '';
                ficha.dataset.fila = fIndex;
                ficha.dataset.columna = cIndex;
                ficha.dataset.tipo = tipoFicha;

                // Si es triángulo, insertamos el polígono SVG vectorial nativo
                if (formaFichas === 'triangulo') {
                    ficha.innerHTML = `
                        <svg class="ficha-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <polygon points="50,5 95,95 5,95" />
                        </svg>
                    `;
                }

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

    bindCambioForma(handler) {
        this.inputForma.addEventListener('change', (e) => handler(e.target.value));
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