import { Aeronave } from "./Aeronave.js";

/* AeronaveComercial -- Aeronave genérica com relação ao comércio aéreo.
 * Attr:
 *      nomeCia (String): Nome da companhia aérea.
 */
export class AeronaveComercial extends Aeronave {
    #nomeCia;

    constructor(prefixo, velocidadeCruzeiro, autonomia, nomeCia) {
        // Validado argumento especifico & chamando construtor pai.
        super(prefixo, velocidadeCruzeiro, autonomia);

        this.#nomeCia = nomeCia;
    }

    get nomeCia() {
        return this.#nomeCia;
    }
}