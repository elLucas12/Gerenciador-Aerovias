import { validate } from 'bycontract';
import { appendFile, readFile } from 'node:fs/promises';
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
    consiste(plano) {
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
        if (this.registrarPlano(plano)) {
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
                return new PlanoDeVoo(dados[0], dados[1], dados[2], dados[3], dados[4], dados[5], parseFloat(dados[6]), dados[7].split('_'), (dados[8].toLowerCase() === 'true' ? true : false));
            }
        }
    }

    /**
     * Codifica os slots para a escrita na base de dados.
     * 
     * @param {Array<String>} slots Array de slots do intervalo de voo.
     * @return Slots em forma de uso computacional ou em forma de texto para armazenamento.
     */
    #binSlots(slots) {
        validate(arguments, ['Array<String>', 'Boolean']);
        let lineSlots = ''
        for (let slot of slots) {
            lineSlots += '_';
            lineSlots += slot;
        }
        return lineSlots;
    }
}
