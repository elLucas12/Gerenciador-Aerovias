import { validate } from "bycontract";
import { Aeronave } from "./Aeronave.js";

/* AeronaveParticular -- Representa aeronaves de peq. porte particulares.
 * Attr:
 *      #respManutencao (String): Nome da empresa responsável pela manutenção.
 */
export class AeronaveParticular extends Aeronave {
    #respManutencao;

    constructor(prefixo, velocidadeCruzeiro, autonomia, respManutencao) {
        // Validado argumento especifico & chamando construtor pai.
        super(prefixo, velocidadeCruzeiro, autonomia);
        validate(arguments, ["String", "Number", "Number", "String"]);

        this.#respManutencao = respManutencao;
    }

    get respManutencao() {
        return this.#respManutencao;
    }
}