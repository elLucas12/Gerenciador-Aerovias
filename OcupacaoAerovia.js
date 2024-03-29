import { validate } from "bycontract";
import { ServicoPlanos } from "./ServicoPlanos";

export class OcupacaoAerovia {

    /** Objeto administrador de dados dos Planos de Voo */
    servicoPlanos = new ServicoPlanos();

    /**
     * Consulta a base de dados e retorna as altitudes ocupadas da aerovia em determinado dia.
     * 
     * @param {String} idAerovia Identificador numérico da aerovia.
     * @param {Date} data Data de consulta de altitude.
     * @param {Boolean} repetir Se o array de retorno deve conter valores repetidos ou não.
     * @return Array de altitudes ocupadas na aerovia.
     */
    async altitudesOcupadas(idAerovia, data, repetir=true) {
        validate(arguments, ['String', 'Date', 'Boolean']);

        let linhasAerovia = await this.servicoPlanos.getPlanosAerovia(idAerovia);
        let altitudes = [];
        if (repetir) {
            for (let line of linhasAerovia) {
                let dataLinha = new Date(Date.parse(line[4]));
                if (dataLinha.getTime() === data.getTime()) {
                    altitudes.push(parseFloat(line[6]));
                }
            }
        } else {
            for (let line of linhasAerovia) {
                let altitudeLinha = parseFloat(line[6]);
                let dataLinha = new Date(Date.parse(line[4]));
                if (dataLinha.getTime() === data.getTime()) {
                    let armazena = true;
                    for (let altitude of altitudes) {
                        if (altitudeLinha === altitude) {
                            armazena = false;
                            break;
                        } 
                    }
                    if (armazena) {
                        altitudes.push();
                    }
                }
            }
        }
        return altitudes;
    }

    /**
     * Verifica quais slots estão em uso em determinada aerovia, data e altitude.
     * 
     * @param {String} idAerovia Identificador numérico da aerovia.
     * @param {Date} data Objeto de data a ser pesquisado.
     * @param {Number} altitude Valor da altitude a ser analisada.
     * @return Slots ocupados conforme configurações de busca.
     */
    async slotsOcupados(idAerovia, data, altitude) {
        validate(arguments, ['String', Date, 'Number']);
        idAerovia = idAerovia.toLowerCase();

        // Busca e compara os valores linha por linha
        let linhasBuffer = await this.servicoPlanos.todos(1);
        let linhasValidas = [];
        for (let line of linhasBuffer) {
            if (line[0].toLowerCase() === idAerovia) {
                let dataLinha = new Date(Date.parse(line[4]));
                if (dataLinha.getTime() === data.getTime()) {
                    if (parseFloat(line[6]) === altitude) {
                        linhasValidas.push(line);
                    }
                }
            }
        }

        // Realiza a verificação dos slots
        let slotsOcupados = [];
        for (let line of linhasValidas) {
            let lineSlot = parseFloat(line[7]);
            for (let slot of slotsOcupados) {
                if (slot === lineSlot) {
                    continue;
                } 
                slotsOcupados.push(lineSlot);
            }
        }
        return slotsOcupados;
    }

    /**
     * Ocupa determinado slot em uma aerovia conforme as configurações passadas.
     * 
     * @param {String} idAerovia Identificador numérico da aerovia.
     * @param {Date} data Objeto de data da ocupação.
     * @param {Number} altitude Valor em pés da altitude dentro da aerovia.
     * @param {Array<Number>} slots Qual o slot que será ocupado.
     * @return Verdade se a operação der certo, senão falso.
     */
    async ocupa(idAerovia, data, altitude, slots) {
        validate(arguments, ['String', Date, 'Number', 'Number']);

        // Alterando os slots
        let planoDeVoo = await this.servicoPlanos.removePlano(idAerovia, data, altitude);
        if (typeof planoDeVoo === 'undefined') {
            return false;
        }
        slots.forEach((value) => {
            planoDeVoo.slots.push(value);
        });

        // Readicionando a linha de dados
        const registrarPlanoReturn = await this.servicoPlanos.registrarPlano(planoDeVoo);
        if (!registrarPlanoReturn) {
            return false;
        }
        return true;
    }

    /**
     * Busca e libera o uso de um determinado slot.
     * 
     * @param {String} idAerovia Identificar numérico da aerovia.
     * @param {Date} data Data especificada para consulta.
     * @param {Number} altitude Valor em pés da altitude.
     * @param {Number} slot Número do slot a ser liberado.
     * @return Verdade se a operação funcionar, senão falso.
     */
    async libera(idAerovia, data, altitude, slot) {
        validate(arguments, ['String', Date, 'Number', 'Number']);

        // Pega o elemento de linha
        let planoDeVoo = await this.servicoPlanos.removePlano(idAerovia, data, altitude);
        if (typeof planoDeVoo === 'undefined') {
            return false;
        }

        // Substituição dos slots.
        let slotIndex = planoDeVoo.slots.indexOf();
        if (slotIndex > -1) {
            planoDeVoo.slots.splice(slotIndex, 1);
            const registrarPlanoReturn = await this.servicoPlanos.registrarPlano(planoDeVoo);
            if (!registrarPlanoReturn) {
                return false;
            }
        } else {
            return false;
        }
        return true;
    }

    /**
     * Verifica e retorna se um slot está ocupado.
     * 
     * @param {String} idAerovia Identificador numérico da aerovia.
     * @param {Date} data Data de consulta.
     * @param {Number} altitude Valor em pés da altitude consultada.
     * @param {Number} slot Slot a ser verificado.
     * @return Verdade se o valor está ocupado, senão falso.
     */
    async isOcupado(idAerovia, data, altitude, slot) {
        validate(arguments, ['String', Date, 'Number', 'Number']);
        idAerovia = idAerovia.toLowerCase();

        const csvBuffer = this.servicoPlanos.todos(1);
        for (let line of csvBuffer) {
            let dados = line.split(',');
            if (dados[3].toLowerCase() === idAerovia) {
                if ((Date(Date.parse(dados[4]))).getTime() === data.getTime()) {
                    if (parseFloat(dados[6]) === altitude) {
                        for (let slotLinha of dados[7].split('_')) {
                            if (parseInt(slotLinha) === slot) {
                                return true;
                            }
                        }
                    }
                }
            }
        }
        return false;
    }
}