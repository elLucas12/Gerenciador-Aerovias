import { validate } from "bycontract";

/* Aerovia -- Representação de aerovias utilizadas pelas aeronaves.
 * Attr:
 *      #id (String): Valor único da aerovia.
 *      #origem (String): Cidade de origem da aerovia.
 *      #destino (String): Cidade de destina da aerovia.
 *      #tamanho (Number): Tamanho da aerovia em km.
 */
export class Aerovia {
    #id;
    #origem;
    #destino;
    #tamanho;

    constructor(id, origem, destino, tamanho) {
        validate(arguments, ["String", "String", "String", "Number"]);
        this.#id = id;
        this.#origem = origem;
        this.#destino = destino;
        this.#tamanho = tamanho;
    }

    get id() { return this.#id; }
    get origem() { return this.#origem; }
    get destino() { return this.#destino; }
    get tamanho() { return this.#tamanho; }
}