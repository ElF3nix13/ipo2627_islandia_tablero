"use strict";

export class Controller {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.inicializarControlador();
    }

    inicializarControlador() {
        this.view.bindNuevoJuego(() => this.manejarNuevoJuego());
        this.view.bindCambioDimension((dimension) => this.manejarCambioDimension(dimension));
        this.view.bindCambioTamano((tamano) => this.manejarCambioTamano(tamano));
        this.view.bindCambioForma((forma) => this.manejarCambioForma(forma));
        this.view.bindMostrarAyuda();

        this.view.bindDragAndDrop((origen, destino) => this.handleDrop(origen, destino));

        this.model.iniciarNuevaPartida();
        this.view.sincronizarControles(this.model.getEstado());
        this.actualizarVistaGeneral();
    }

    manejarNuevoJuego() {
        this.model.iniciarNuevaPartida(this.model.dimension);
        this.actualizarVistaGeneral();
    }

    manejarCambioDimension(dimension) {
        if (this.model.setDimension(dimension)) {
            this.actualizarVistaGeneral();
        }
    }

    manejarCambioTamano(tamano) {
        if (this.model.setTamanoFichas(tamano)) {
            this.actualizarVistaGeneral();
        }
    }

    manejarCambioForma(forma) {
        if (this.model.setFormaFichas(forma)) {
            this.actualizarVistaGeneral();
        }
    }

    handleDrop(origen, destino) {
        if (this.model.intercambiarFichas(origen, destino)) {
            this.actualizarVistaGeneral();
        }
    }

    actualizarVistaGeneral() {
        const estado = this.model.getEstado();
        this.view.renderizarTablero(estado.tablero, estado);
        this.view.actualizarEstadisticas(estado.movimientos, estado.juegoTerminado);
    }
}