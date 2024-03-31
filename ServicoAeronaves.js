import nReadlines from 'n-readlines';
import { validate } from "bycontract";
import { AeronaveParticular } from "./AeronaveParticular.js";
import { AeronavePassageiros } from "./AeronavePassageiros.js";
import { AeronaveCarga } from "./AeronaveCarga.js";

/**
 * Obj. de serviço para a manutenção e uso dos objetos "Aeronave"
 * armazenados na base de dados.
 * 
 * Pela estrutura de serviços optada pelo projeto, `o objeto da classe deve
 * ser referenciado em um script para uso próprio`, mesmo em métodos com
 * possibilidade de construção estática. Isso internaliza e, logo, facilita
 * o desenvolvimento de quaisquer estruturas de dados ou modelos posteriores.
 */
export class ServicoAeronaves {
    /**
     * Caminho do arquivo que armazena as informações dos objs. Aeronave
     */
    #csvAeronaves = 'DadosAeronaves.csv';

    /** 
     * Retorna todas as aeronaves registradas na base de dados através da
     * leitura e verificação linha por linha da base de dados em texto (CSV).
     * 
     * @return Array com todos os obj. referenciados pela base de dados.
     */
    todas() {
        let arq = new nReadlines(this.#csvAeronaves);
        let buff = "";
        let line = "";
        let dados = "";
        let dadosAeronave = [];
        let aeronaves = [];

        // Leitura linha por linha da base de dados.
        arq.next();
        while (buff = arq.next()) {
            line = buff.toString();
            dados = line.split(',');
            
            // Definido o obj. conforme os dados do CSV.
            let aeronave = this.#constroiAeronavePorArray(dados);
            if (aeronave === null) {
                console.error(`Valores da linha inválidos => "${line}"`);
                continue;
            }
            aeronaves.push(aeronave);
        }
        return aeronaves;
    }

    /**
     * Busca uma aeronave no CSV a partir do seu prefixo.
     * 
     * Realiza-se uma busca a partir de comparação do parâmetro (prefixo) passado
     * pelo usuário e, uma vez encontrada a linha da aeronave, constrói-se o objeto
     * Aeronave com seus respectivos dados, retornando-o.
     * 
     * @param {String} pfx Prefixo da aeronave no CSV.
     * @return Objeto Aeronave pesquisado na base de dados.
     */
    recupera(pfx) {
        validate(arguments, ['String']);
        pfx = pfx.toLowerCase();

        // Filedescriptor e variáveis de adm. buffer.
        let arq = new nReadlines(this.#csvAeronaves);
        let buff = "";
        let line = "";
        let dados = "";

        // Leitura linha por linha da base de dados.
        arq.next();
        while (buff = arq.next()) {
            line = buff.toString();
            dados = line.split(',');
            if (dados[0].toLowerCase() === pfx) {
                return this.#constroiAeronavePorArray(dados);
            }
        }
    }

    /**
     * Controi um objeto Aeronave a partir de um array de dados.
     * 
     * O método verifica a linha de dados a partir dos elementos booleanos e altera os dados 
     * conforme necessário.
     * 
     * @param {Array<String>} dados Array de dados de Aeronave em sequência (conforme CSV).
     * @return Objeto do tipo Aeronave, conforme a especificação dos dados.
     */
    #constroiAeronavePorArray(dados) {
        validate(arguments, ['Array.<String>']);
        if (dados[3] === 'true') {
            return new AeronaveParticular(dados[0], parseFloat(dados[1]), parseFloat(dados[2]), dados[4]);
        } else if (dados[5] === 'true' && dados[7] === 'true') {
            return new AeronaveCarga(dados[0], parseFloat(dados[1]), parseFloat(dados[2]), dados[6], parseFloat(dados[8]));
        } else if (dados[5] === 'true' && dados[9] === 'true') {
            return new AeronavePassageiros(dados[0], parseFloat(dados[1]), parseFloat(dados[2]), dados[6], parseInt(dados[10]));
        } else {
            return null;
        }
    }
}