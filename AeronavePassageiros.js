import { validate } from "bycontract";
import { AeronaveComercial } from "./AeronaveComercial.js";

/* AeronavePassageiros -- Estrutura com relação aos dados e valores dos
 * passageiros de uma aeronave.
 * Attr:
 *      #maxPassageiros (Number): Quantidade máxima de passageiros.
 */
export class AeronavePassageiros extends AeronaveComercial {
    #maxPassageiros;

    constructor(prefixo, velocidadeCruzeiro, autonomia, nomeCia, maxPassageiros) {
        // Validado argumento especifico & chamando construtor pai.
        super(prefixo, velocidadeCruzeiro, autonomia, nomeCia);
        validate(arguments, ["String", "Number", "Number", "String", "Number"]);
        
        this.#maxPassageiros = maxPassageiros;
    }

    get maxPassageiros() {
        return this.#maxPassageiros;
    }
}