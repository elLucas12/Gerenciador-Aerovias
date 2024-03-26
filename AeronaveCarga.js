import { validate } from "bycontract";
import { AeronaveComercial } from "./AeronaveComercial.js";

/* AeronaveCarga -- Representa a carga da aeronave em que for referenciado.
 * Attr:
 *      #pesoMax (Number): Peso máximo de carga para a aeronave.
 */
export class AeronaveCarga extends AeronaveComercial {
    #pesoMax;

    constructor(prefixo, velocidadeCruzeiro, autonomia, nomeCia, pesoMax) {
        // Validado argumento especifico & chamando construtor pai.
        super(prefixo, velocidadeCruzeiro, autonomia, nomeCia);
        validate(arguments, ["String", "Number", "Number", "String", "Number"]);

        this.#pesoMax = pesoMax;
    }

    get pesoMax() {
        return this.#pesoMax;
    }
}