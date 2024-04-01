import { validate } from "bycontract";
import { ServicoPlanos } from "./ServicoPlanos.js";

/**
 * Permite a consulta e validação da população das aerovias do sistema.
 * 
 * Os métodos se limitam ao obj ServicoPlanos para diminuir o acesso à base de dados CSV,
 * diminuíndo o tempo de processamento e retorno dos dados.
 */
export class OcupacaoAerovia {

    /** Objeto administrador de dados dos Planos de Voo */
    servicoPlanos = new ServicoPlanos();

    /**
     * Consulta a base de dados e retorna as altitudes ocupadas da aerovia em determinado dia.
     * 
     * @param {String} idAerovia Identificador numérico da aerovia.
     * @param {Date} data Data de consulta de altitude.
     * @param {Boolean} retornarLinhas Se o método deve retornar a linha de dados completa.
     * @param {Boolean} repetir Se o array de retorno deve conter valores repetidos ou não.
     * @return Array de altitudes ocupadas na aerovia.
     */
    async altitudesOcupadas(idAerovia, data, retornarLinhas=false, repetir=true) {
        validate(arguments, ['String', 'Date', 'Boolean']);

        let linhasAerovia = await this.servicoPlanos.getPlanosAerovia(idAerovia);
        let altitudes = [];
        if (repetir) {
            for (let line of linhasAerovia) {
                let dados = line.split(',');
                let dataLinha = new Date(Date.parse(dados[4]));
                if (dataLinha.getTime() === data.getTime()) {
                    if (retornarLinhas) {
                        altitudes.push(line);
                    } else {
                        altitudes.push(parseFloat(dados[6]));
                    }
                }
            }
        } else { // Não é usado...
            for (let line of linhasAerovia) {
                let dados = line.split(',');
                let altitudeLinha = parseFloat(dados[6]);
                let dataLinha = new Date(Date.parse(dados[4]));
                if (dataLinha.getTime() === data.getTime()) {
                    let armazena = true;
                    for (let altitude of altitudes) {
                        if (altitudeLinha === altitude) {
                            armazena = false;
                            break;
                        } 
                    }
                    if (armazena) {
                        if (retornarLinhas) {
                            altitudes.push(line);
                        } else {
                            altitudes.push(altitudeLinha);
                        }
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
     * @param {Boolean} retornaLinhas Se as linhas devem ser retornadas ao invés de apenas os slots.
     * @return Slots ocupados conforme configurações de busca.
     */
    async slotsOcupados(idAerovia, data, altitude, retornaLinhas=false) {
        validate(arguments, ['String', Date, 'Number', 'Boolean']);
        idAerovia = idAerovia.toLowerCase();

        // Busca e compara os valores linha por linha
        let slotsOcupados = [];
        let linhasBuffer = await this.servicoPlanos.todos(1);
        for (let line of linhasBuffer) {
            if (line[0].toLowerCase() === idAerovia) {
                let dataLinha = new Date(Date.parse(line[4]));
                if (dataLinha.getTime() === data.getTime()) {
                    if (parseFloat(line[6]) === altitude) {
                        let slotLinha = (line[7].split('_')).map((str) => {
                            return parseInt(str);
                        });
                        let stop = false;
                        for (let slot of slotsOcupados) {
                            if (slot === slotLinha) {
                                stop = true;
                                break;
                            }
                        }
                        if (stop) {
                            continue;
                        }
                        if (retornaLinhas) {
                            slotsOcupados.push(line);
                        } else {
                            slotsOcupados.push(slotLinha);
                        }
                    }
                }
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
        let slotIndex = planoDeVoo.slots.indexOf(slot);
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

        const planosDeVoo = await this.servicoPlanos.todos(0);
        for (let planoDeVoo of planosDeVoo) {
            if (planoDeVoo.idAerovia.toLowerCase() === idAerovia && planoDeVoo.data.getTime() === data.getTime() && planoDeVoo.altitude === altitude && !planoDeVoo.cancelado) {
                for (let slotAux of planoDeVoo.slots) {
                    if (slotAux === slot) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    /**
     * Consulta planos de voo pela ID da aerovia e data.
     * 
     * @param {String} idAerovia Identificador numérico da aerovia.
     * @param {Date} data Data de consulta.
     * @return Array com os planos de voo consultados.
     */
    async ocupadosNaData(idAerovia, data) {
        validate(arguments, ['String', Date]);
        idAerovia = idAerovia.toLowerCase();

        const planosDeVoo = await this.servicoPlanos.todos(0);
        let ocupacao = [];
        for (let planoDeVoo of planosDeVoo) {
            if (!planoDeVoo.cancelado && planoDeVoo.idAerovia.toLowerCase() === idAerovia && planoDeVoo.data.getTime() == data.getTime()) {
                ocupacao.push(planoDeVoo);
            }
        }
        return ocupacao;
    }
}