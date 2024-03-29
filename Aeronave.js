/* Aeronave -- Representa um tipo genérico de aeronave.
 * Attr:
 *      #prefixo (String)
 *      #velocidadeCruzeiro (Number)
 *      #autonomia (Number)
 */
export class Aeronave {
    #prefixo;
    #velocidadeCruzeiro;
    #autonomia;

    constructor(prefixo, velocidadeCruzeiro, autonomia) {
        this.#prefixo = prefixo;
        this.#velocidadeCruzeiro = velocidadeCruzeiro;
        this.#autonomia = autonomia;
    }

    get prefixo() { return this.#prefixo; }
    get velocidadeCruzeiro() { return this.#velocidadeCruzeiro; }
    get autonomia() { return this.#autonomia; }
}