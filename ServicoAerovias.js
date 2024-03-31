import nReadlines from 'n-readlines';
import { validate } from "bycontract";
import { Aerovia } from "./Aerovia.js";

/**
 * Atua como um serviço que controla e faz manutenção dos objetos 'Aerovia' 
 * e seus respectivos dados armazenados.
 * 
 * Pela estrutura de serviços optada pelo projeto, `o objeto da classe deve
 * ser referenciado em um script para uso próprio`, mesmo em métodos com
 * possibilidade de construção estática. Isso internaliza e, logo, facilita
 * o desenvolvimento de quaisquer estruturas de dados ou modelos posteriores.
 */
export class ServicoAerovias {
    #csvAerovias = "DadosAerovias.csv";

    /**
     * Retorna as aerovias através de uma certa origem e um certo destino com uma
     * leitura linha por linha da base de dados CSV.
     * 
     * Para recuperar os objs. 'Aerovia' pesquisados, o retorno deve ser direto
     * para uma variável, assim possibilitando o respectivo acesso. Os parâmetros
     * de entrada podem apresentar o valor 'n' para possibilitar a consulta de
     * qualquer valor para o respectivo campo.
     * 
     * @param {String} origem Cidade de origem da aerovia.
     * @param {String} destino Cidade de destino da aerovia.
     * @returns Array de objetos 'Aerovia' resultado da pesquisa.
     */
    recupera(origem, destino) {
        validate(arguments, ["String", "String"]);
        origem = origem.toLowerCase();
        destino = destino.toLowerCase();

        // filedescriptor do CSV de aerovias.
        let arq = new nReadlines(this.#csvAerovias);
        let buff = "";
        let line = "";
        let dados = "";
        let dadosAerovia = [];
        let aerovias = [];

        // Comparando dados na memória.
        arq.next();
        while (buff = arq.next()) {
            line = buff.toString('utf8');
            dados = line.split(',');
            if ((dados[1].toLowerCase() === origem || origem === 'n') && (dados[2].toLowerCase() === destino || destino === 'n')) {
                // Digestão dos dados já divididos.
                dadosAerovia = {
                    "id": dados[0],
                    "origem": dados[1],
                    "destino": dados[2],
                    "tamanho": parseFloat(dados[3])
                };

                aerovias.push(new Aerovia(
                    dadosAerovia['id'],
                    dadosAerovia['origem'],
                    dadosAerovia['destino'],
                    dadosAerovia['tamanho']
                ));
            }
        }
        // Saída com montagem dos objs. pesquisados.
        return aerovias;
    }

    /**
     * Recupera os dados de uma aerovia a partir de seu identificador numérico. 
     * 
     * Formula e retorna um objeto aerovia, conforme especificação. Busca-se na base de
     * dados CSV um identificador idêntico ao passado de parâmetro e, com a mesma linha de 
     * dados, constrói-se o objeto Aerovia.
     * 
     * @param {String} id Identificador númerico da aerovia dentro da base de dados.
     * @return Objeto Aerovia conforme identificador.
     */
    recuperaId(id) {
        validate(arguments, ["String"]);
        id = id.toLowerCase();

        // filedescriptor do CSV.
        let arq = new nReadlines(this.#csvAerovias);
        let buff = "";
        let line = "";
        let dados = "";

        // Buscando aerovia conforme identificador.
        arq.next();
        while (buff = arq.next()) {
            line = buff.toString('utf8');
            dados = line.split(',');
            if (dados[0].toLowerCase() === id) {
                // Criando um novo objeto Aerovia e retornando-o.
                let aerovia;
                try {
                    aerovia = new Aerovia(dados[0], dados[1], dados[2], parseFloat(dados[3]));
                } catch (err) {
                    console.error('Construção do obj Aerovia deu erro!');
                    return null;
                }
                return aerovia;
            }
        }
    }
}