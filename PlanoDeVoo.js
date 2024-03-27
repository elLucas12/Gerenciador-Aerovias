/**
 * Representa o plano de voo - instânciado no obj ServicoPlanos.
 *
 * Esse objeto armazena e administra as informações de voo a fim de submeter
 * e identificar a necessidade de cancelamento do voo em determinados casos.
 * Ou seja, ele guarda os dados de indexação para acesso externo e retorna erro
 * no armazenamento inadequado (ids idênticos e outros).
 */
export class PlanoDeVoo {
    /** Identificador numérico do plano de voo */
    #id;

    /** Matrícula do piloto responsável por conduzir o voo */
    #matriculaPiloto;

    /** Identificador numérico da aerovia escolhida */
    #idAerovia;

    /** Data esperada do voo */
    #data;

    /** Horário esperado do voo */
    #horario;

    /** Altitude que será utilizada dentro da aerovia */
    #altitude;

    /** Lista de horários (slots) ocupados pelo voo */
    #slots = [];

    /** Armazena se o voo foi cancelado ou não */
    cancelado = false;

    get matriculaPiloto() {
        return this.#matriculaPiloto;
    }
}
