import promptsync from "prompt-sync";
const prompt = promptsync({sigint: true});

import { ServicoAeronaves } from "./ServicoAeronaves";
import { ServicoAerovias } from "./ServicoAerovias";
import { ServicoPilotos } from "./ServicoPilotos";
import { ServicoPlanos } from "./ServicoPlanos";
import { OcupacaoAerovia } from "./OcupacaoAerovia";

export class Menu {

    /** Objeto gerenciador de aeronaves */
    #servicoAeronaves = new ServicoAeronaves();

    /** Objeto gerenciador de aerovias */
    #servicoAerovias = new ServicoAerovias();

    /** Objeto gerenciador de pilotos */
    #servicoPilotos = new ServicoPilotos();

    /** Objeto gerenciador de planos de voo */
    #servicoPlanos = new ServicoPlanos();

    /** Objeto gerenciador de ocupação das aerovias */
    #ocupacaoAerovias = new OcupacaoAerovia();

    /**
     * Lista as aerovias existentes entre dois aeroportos.
     * 
     * Apresenta-se na tela a lista de todas as aerovias que partem do aeroporto A 
     * para o aeroporto B.
     */
    listarAerovias() {
        let origem = String(prompt('Qual a origem? '));
        let destino = String(prompt('Qual o destino? '));
        let aerovias = this.#servicoAerovias.recupera(origem, destino);
        for (let aerovia of aerovias) {
            console.log(`\t${aerovia.id} | ${aerovia.origem} | ${aerovia.destino}`);
        }
    }

    /**
     * Lista as altitudes livres em uma determinada aerovia em um determinado horário.
     * 
     * Apresenta na telas as altitudes livres.
     */
    listarAltitudesLivres() {
        let idAerovia = String(prompt('Qual o ID da aerovia? '));
        while (true) {
            let horario = String(prompt('Hora a ser consultada (hh:mm, ex "13:56"): '));
            horario = horario.split(':');
            if (horario.length !== 2) {
                console.error(`Entrada de hora "${horario}" é inválida! Tente novamente.`);
                continue;
            } else {
                break;
            }
        }
        while (true) {
            let data = String(prompt('Qual o dia? (dd/mm/aaaa - digite \'p\' para o dia de hoje) '));
            if (data === 'p') {
                data = new Date();
            } else {
                try {
                    data = new Date(Date.parse(data));
                } catch (err) {
                    console.error(`Falha da criação da data (Obj. Date). Exception=${err}`);
                    continue;
                }
            }
            break;
        }

        // Busca e compara os valores
        let horaConsulta = parseInt(horario[0]);
        this.#servicoPlanos.todos(1).then((planosDeVoo) => {
            let ocupacaoAltitudes = new Map();
            for (let altitude = 25000; altitude <= 35000; altitude += 1000) {
                ocupacaoAltitudes.set(altitude, false);
                for (let line of planosDeVoo) {
                    // Verifica ID da aerovia
                    if (line[0].toLowerCase() === idAerovia) {
                        // Verifica a data de consulta
                        if ((new Date(Date.parse(line[4]))).getTime() === data.getTime()) {
                            // Verifica o valor de altitude
                            if (parseFloat(line[6]) === altitude) {
                                // verifica o horário da consulta
                                let slotLinha = (line[7].split('_')).map((str) => { return parseInt(str); });
                                for (let slot of slotLinha) {
                                    if (slot === parseInt(horario[0])) {
                                        ocupacaoAltitudes.set(altitude, true);
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // output de dados
            console.log('As seguinte altitudes estão LIVRES:');
            for (const ocupada of ocupacaoAltitudes.entries()) {
                if (!ocupada[0]) {
                    console.log(`\t${ocupada[1]} pés`);
                }
            }
        });
    }

    aprovarPlanoDeVoo() {

    }

    listarPlanos() {

    }

    listarOcupacao() {

    }

    cancelarPlano() {

    }

    sair() {

    }
}