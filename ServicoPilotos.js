import { validate } from 'bycontract';
import nReadlines from 'n-readlines';
import { Piloto } from './Piloto.js';

/**
 * Serviço que permite o acesso e administração dos objs. 'Piloto' armazenados.
 * 
 * Pela estrutura de serviços optada pelo projeto, `o objeto da classe deve
 * ser referenciado em um script para uso próprio`, mesmo em métodos com
 * possibilidade de construção estática. Isso internaliza e, logo, facilita
 * o desenvolvimento de quaisquer estruturas de dados ou modelos posteriores.
 */
export class ServicoPilotos {
    #csvPilotos = "DadosPilotos.csv";

    /**
     * Realiza uma consulta na base de dados através de uma leitura linha por 
     * linha e retorna o obj. relacionado.
     * 
     * O objeto de retorno deve ser armazenado em uma variável e seus dados
     * acessados diretamente (gets do obj.).
     * 
     * @param {String} matricula Matrícula a ser pesquisada na base de dados.
     * @returns Obj. Piloto montado a partir da consulta.
     */
    recupera(matricula) {
        validate(arguments, ['String']);
        matricula = matricula.toLowerCase();
        
        // Armazendo filedescriptor do CSV de pilotos.
        let arq = new nReadlines(this.#csvPilotos);
        let buff = "";
        let line = "";
        let dados = "";
        let dadosPiloto = [];

        // Criando filedescriptor e comparando dados na memória.
        arq.next();
        while (buff = arq.next()) {
            line = buff.toString('utf8');
            dados = line.split(',');
            if (dados[0].toLowerCase() === matricula) {
                // Digestão dos dados já divididos.
                dadosPiloto = {
                    "matricula": dados[0],
                    "nome": dados[1],
                    "habilitacaoAtiva": (dados[2] === 'true' ? true : false )
                };

                // Saída com montagem do obj. Piloto pesquisado.
                return (new Piloto(
                    dadosPiloto['matricula'],
                    dadosPiloto['nome'],
                    dadosPiloto['habilitacaoAtiva']
                ));
            }
        }
    }

    /**
     * Realiza uma leitura linha por linha da base de dados de pilotos (CSV), armazena
     * seus valores e construi os objetos 'Piloto' com referência em tais dados.
     * 
     * @returns Array com todos os objetos Piloto da base de dados.
     */
    todos() {
        let arq = new nReadlines(this.#csvPilotos);
        let buff = "";
        let line = "";
        let dados = "";
        let dadosPiloto = [];
        let pilotos = [];

        arq.next();
        while (buff = arq.next()) {
            line = buff.toString();

            // Lidando com a linha de dados atual.
            dados = line.split(',');
            dadosPiloto = {
                    "matricula": dados[0],
                    "nome": dados[1],
                    "habilitacaoAtiva": (dados[2] === 'true' ? true : false)
            };

            // Adição do obj. a estrutura de dados.
            pilotos.push(new Piloto(
                dadosPiloto['matricula'],
                dadosPiloto['nome'],
                dadosPiloto['habilitacaoAtiva']
            ));
        }
        return pilotos;
    }
}
