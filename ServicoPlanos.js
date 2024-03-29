import { validate } from 'bycontract';
import { appendFile, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { PlanoDeVoo } from './PlanoDeVoo.js';
import { ServicoPilotos } from './ServicoPilotos.js';
import { ServicoAerovias } from './ServicoAerovias.js';
import { ServicoAeronaves } from './ServicoAeronaves.js';

/**
 * Elabora e controla os planos de voo registrados na base de dados CSV.
 * 
 * Esse objeto construi instâncias dos objetos de serviço para verificação
 * dos dados dos planos de voo.
 * 
 * to-do: Validação dos dados de plano (especializados - voo/altitude).
 */
export class ServicoPlanos {

    /** Caminho da base de dados CSV */
    #csvPlanos = resolve('DadosPlanosDeVoo.csv');

    /** Serviço Pilotos para verificação de dados do plano de voo. */
    servicoPilotos = new ServicoPilotos();
    servicoAeronaves = new ServicoAeronaves();
    servicoAerovias = new ServicoAerovias();

    /**
     * Recebe um plano de voo pronto e valida os atributos.
     *
     * @param {PlanoDeVoo} plano Obj. PlanoDeVoo com os dados completos.
     * @return Identificador do plano de voo ou, em caso de erro, um null pointer.
     */
    async consiste(plano) {
        validate(arguments, [PlanoDeVoo]);

        let erros = [];
        let isCancelado = false;

        // Objetos de construção do plano de voo.
        let piloto = this.servicoPilotos.recupera(plano.matriculaPiloto);
        let aerovia = this.servicoAerovias.recuperaId(plano.idAerovia);
        let aeronave = this.servicoAeronaves.recupera(plano.pfxAeronave);

        // Verifica os dados dos objetos.
        erros = this.#tagsErros(piloto, aerovia, aeronave, erros);
        if (erros.length === 0) plano.cancelado = isCancelado;

        // Registra o plano e retorna o identificador.
        let registrarPlanoReturn = await this.registrarPlano(plano);
        if (registrarPlanoReturn) {
            return plano.id;
        }
    }

    /**
     * Verifica o retorno da pesquisa por identificador dos objetos do sistema.
     *  
     * @param {*} piloto Variável 'Piloto' do retorno da pesquisa no CSV.
     * @param {*} aerovia Variável 'Aerovia' do retorno da pesquisa no CSV.
     * @param {*} aeronave Variável 'Aeronave' do retorno da pesquisa no CSV.
     * @param {Array<String>} erros Array de erros a serem exibidos (dentro do método, concatenados).
     * @return {Array<String>} Array de erros com a adição dos erros de verificação dos objetos.
     */
    #tagsErros(piloto, aerovia, aeronave, erros) {
        validate(arguments, ['*', '*', '*', 'Array<String>']);

        if (!typeof piloto === 'undefined') {
            erros.push('Piloto não encontrado no CSV.');
        } else {
            if (piloto === null) {
                erros.push(`Os dados do Piloto estão corrompidos.`);
            } 
        }
        if (typeof aerovia === 'undefined') {
            erros.push('Aerovia não encontrada no CSV.');
        } else {
            if (aerovia === null) {
                erros.push('Os dados da Aerovia estão corrompidos')
            }
        }
        if (typeof aeronave === 'undefined') {
            erros.push('Aeronave não encontrada no CSV.');
        } else {
            if (aeronave === null) {
                erros.push('Os dados da Aeronave estão corrompidos.');
            }
        }
        return erros;
    }

    /**
     * Registra o plano de voo na respectiva base de dados CSV.
     * 
     * @param {PlanoDeVoo} plano Plano de voo a ser registrado.
     * @return Verdade se o registro funcionou, senão falso.
     */
    async registrarPlano(plano) {
        validate(arguments, [PlanoDeVoo]);

        // Construindo buffer e armazenando na base de dados CSV.
        let binSlots = this.#binSlots(plano.slots);
        let buffer = `${plano.id},${plano.matriculaPiloto},${plano.pfxAeronave},${plano.idAerovia},${plano.data},${plano.horario},${plano.altitude},${binSlots},${plano.cancelado}`;

        let appendFileReturn = await appendFile(this.#csvPlanos, buffer);
        if (typeof appendFileReturn === 'undefined') {
            return false;
        }
        return true;
    }

    /**
     * Pesquisar e constroi um objeto PlanoDeVoo presente na base de dados CSV.
     * 
     * Caso o objeto não exista na base de dados, o método retorna o valor 'undefined'.
     * Agora, caso o objeto não apresente o padrão correto de dados, retorna-se 'null'.
     * 
     * @param {String} id Identificador numérico do plano de voo.
     * @return Objeto PlanoDeVoo pesquisado ou valor de erro.
     */
    async recupera(id) {
        validate(arguments, ['String']);
        id = id.toLowerCase();
        const csvBuffer = await readFile(this.#csvPlanos, { encoding: 'utf8' });
        for (let line of csvBuffer.split('\n')) {
            let dados = line.split(',');
            if (dados[0].toLowerCase() === id) {
                let slots = dados[7].split('_').map((str) => {
                    return parseInt(str);
                });
                return new PlanoDeVoo(dados[0], dados[1], dados[2], dados[3], dados[4], dados[5], parseFloat(dados[6]), slots, (dados[8].toLowerCase() === 'true' ? true : false));
            }
        }
    }

    /**
     * Codifica os slots para a escrita na base de dados.
     * 
     * @param {Array<Number>} slots Array de slots do intervalo de voo.
     * @return Slots em forma de uso computacional ou em forma de texto para armazenamento.
     */
    #binSlots(slots) {
        validate(arguments, ['Array<Number>', 'Boolean']);
        let lineSlots = ''
        for (let slot of slots) {
            lineSlots += '_';
            lineSlots += slot.toString();
        }
        return lineSlots;
    }

    /**
     * Retorna todos os valores da base de dados CSV.
     * 
     * @param {Number} mode Mode de leitura e retorno dos dados.
     * @return Todos os dados do CSV formatados conforme o modo escolhido.
     * 
     * Os dados retornados podem ser retornados em diferentes formatos predefinidos,
     * conforme a seguir:
     * - 0 retorna a base de dados já em formato de objeto 'PlanoDeVoo' (padrão);
     * - 1 retorna a base de dados em forma de array de strings;
     * - 2 retorna a base de dados em texto puro (string única).
     */
    async todos(mode) {
        validate(arguments, ['Number']);
        
        const csvBuffer = await readFile(this.#csvPlanos, { encoding: 'utf8' });
        switch(mode) {
            case 0:
                let objArray = [];
                let count = 0;
                for (let line of csvBuffer.split('\n')) {
                    count++;
                    for (let dados of line.split(',')) {
                        try {
                            let slots = dados[7].split('_').map((str) => {
                                return parseInt(str);
                            });
                            objArray.push(new PlanoDeVoo(dados[0], dados[1], dados[2], dados[3], dados[4], dados[5], parseFloat(dados[6]), slots, (dados[8].toLowerCase() === 'true' ? true : false)));
                        } catch (err) {
                            console.error(`Linha ${count} está corrompida!`);
                        }
                    }
                }
                return objArray;
            case 1:
                csvBuffer = csvBuffer.split('\n');
                csvBuffer.shift();
                return csvBuffer;
            case 2:
                return csvBuffer;
            default:
                console.error('Modo de retorno de dados inválido!');
                return null;
        }
    }

    /**
     * Pesquisa as linhas relacionadas a aerovia e as retorna.
     * 
     * @param {String} idAerovia Identificador numérico da aerovia.
     * @return Array de strings com planos em determinada aerovia.
     */
    async getPlanosAerovia(idAerovia) {
        validate(arguments, ['String']);
        idAerovia = idAerovia.toLowerCase();
        let linhasAerovia = [];

        // Leitura linha por linha
        const csvBuffer = await readFile(this.#csvPlanos, { encoding: 'utf8' });
        for (let line of csvBuffer.split('\n')) {
            let dados = line.split(',');
            if (dados[3].toLowerCase() === idAerovia) {
                linhasAerovia.push(line);
            }
        }
        return linhasAerovia;
    }

    /**
     * Busca, remove e retorna um plano de voo da base de dados.
     * 
     * @param {String} idAerovia Identificador numérico da aerovia.
     * @param {Date} data Data de consulta.
     * @param {Number} altitude Altitude de consulta.
     * @return Objeto removido pela consulta.
     */
    async removePlano(idAerovia, data, altitude) {
        validate(arguments, ['String', Date, 'Number']);
        idAerovia = idAerovia.toLowerCase();

        // Busca e verifica os valores na base de dados.
        const csvBuffer = await readFile(this.#csvPlanos, { encoding: 'utf8' });
        let newCsvBuffer = csvBuffer.split('\n')
        for (let line of newCsvBuffer) {
            let dados = line.split(',');
            if (dados[3].toLowerCase() === idAerovia) {
                let dataLinha = new Date(Date.parse(dados[4]));
                if (dataLinha.getTime() === data.getTime()) {
                    let altitudeLinha = parseFloat(dados[6]);
                    if (altitudeLinha === altitude) {
                        let lineIndex = newCsvBuffer.indexOf(line);
                        if (lineIndex > -1) {
                            newCsvBuffer.splice(lineIndex, 1);
                        } else {
                            return undefined;
                        }
                        await writeFile(this.#csvPlanos, newCsvBuffer, 'utf8');
                        let slots = dados[7].split('_').map((str) => {
                            return parseInt(str);
                        });
                        return new PlanoDeVoo(dados[0], dados[1], dados[2], idAerovia, dataLinha, dados[5], altitudeLinha, slots, (dados[8].toLowerCase() === 'true' ? true : false));
                    }
                }
            }
        }
    }
}
