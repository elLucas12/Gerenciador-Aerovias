import { validate } from "bycontract";

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
    id;

    /** Matrícula do piloto responsável por conduzir o voo */
    matriculaPiloto;

    /** Prefixo da aeronave que será utilizada pelo piloto */
    pfxAeronave;

    /** Identificador numérico da aerovia escolhida */
    idAerovia;

    /** Data esperada do voo */
    data;

    /** Horário esperado do voo */
    horario;

    /** Altitude que será utilizada dentro da aerovia */
    altitude;

    /** Lista de horários (slots) ocupados pelo voo */
    slots = [];

    /** Armazena se o voo foi cancelado ou não */
    cancelado = false;

    /**
     * @param {String} id Identificador numérico do plano de voo.
     * @param {String} matriculaPiloto Matrícula do piloto do plano de voo.
     * @param {String} pfxAeronave Prefixo da aeronave a ser usada.
     * @param {String} idAerovia Identificar numérico da aerovia.
     * @param {Date} data Data de realização do plano de voo (dd/mm/aaaa).
     * @param {String} horario Horário de realização (hh:mm).
     * @param {Number} altitude Altitude de realização do plano de voo (em un.).
     * @param {Array<Number>} slots Array com os horários (slots) utilizado pelo voo.
     * @param {Boolean} cancelado Armazena se o voo é identificado como cancelado.
     */
    constructor(id, matriculaPiloto, pfxAeronave, idAerovia, data, horario, altitude, slots, cancelado) {
        validate(arguments, ['String', 'String', 'String', 'String', Date, 'String', 'Number', 'Array.<Number>', 'Boolean']);

        this.id = id;
        this.matriculaPiloto = matriculaPiloto;
        this.pfxAeronave = pfxAeronave;
        this.idAerovia = idAerovia;
        this.data = data;
        this.horario = horario;
        this.altitude = altitude;
        this.slots = slots;
        this.cancelado = cancelado;
    }
}
