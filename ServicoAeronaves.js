import nReadlines from 'n-readlines';
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
    #csvAeronaves = "DadosAeronaves.csv";

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
            if (dados[3] === 'true') {
                dadosAeronave = {
                    "prefixo": dados[0],
                    "velocidadeCruzeiro": parseFloat(dados[1]),
                    "autonomia": parseFloat(dados[2]),
                    "respManutencao": dados[4]
                };
                aeronaves.push(new AeronaveParticular(
                    dadosAeronave['prefixo'],
                    dadosAeronave['velocidadeCruzeiro'],
                    dadosAeronave['autonomia'],
                    dadosAeronave['respManutencao']
                ));
            } else if (dados[5] === 'true' && dados[7] === 'true') {
                dadosAeronave = {
                    "prefixo": dados[0],
                    "velocidadeCruzeiro": parseFloat(dados[1]),
                    "autonomia": parseFloat(dados[2]),
                    "nomeCia": dados[6],
                    "pesoMax": parseFloat(dados[8])
                };
                aeronaves.push(new AeronaveCarga(
                    dadosAeronave['prefixo'],
                    dadosAeronave['velocidadeCruzeiro'],
                    dadosAeronave['autonomia'],
                    dadosAeronave['nomeCia'],
                    dadosAeronave['pesoMax']
                ));
            } else if (dados[5] === 'true' && dados[9] === 'true') {
                dadosAeronave = {
                    "prefixo": dados[0],
                    "velocidadeCruzeiro": parseFloat(dados[1]),
                    "autonomia": parseFloat(dados[2]),
                    "nomeCia": dados[6],
                    "maxPassageiros": parseInt(dados[10])
                };
                aeronaves.push(new AeronavePassageiros(
                    dadosAeronave['prefixo'],
                    dadosAeronave['velocidadeCruzeiro'],
                    dadosAeronave['autonomia'],
                    dadosAeronave['nomeCia'],
                    dadosAeronave['maxPassageiros']
                ));
            } else {
                console.error(`Valores da linha inválidos => "${line}"`);
            }
        }
        return aeronaves;
    }
}