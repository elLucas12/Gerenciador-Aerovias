import { validate } from 'bycontract';

/* Piloto -- Classe de representação do agente "piloto".
Attr:
    matrícula (String)
    nome (String)
    habilitacaoAtiva (Boolean)
*/
export class Piloto {
    #matricula;
    #nome;
    #habilitacaoAtiva;

    constructor(matricula, nome, habilitacaoAtiva) {
        validate(arguments, ["String", "String", "Boolean"]);
        this.#matricula = matricula;
        this.#nome = nome;
        this.#habilitacaoAtiva = habilitacaoAtiva;
    }

    get nome() {
        return this.#nome;
    }

    get matricula() {
        return this.#matricula;
    }

    get habilitacaoAtiva() {
        return this.#habilitacaoAtiva;
    }
}