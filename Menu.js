import promptsync from "prompt-sync";
const prompt = promptsync({sigint: true});

import { ServicoAeronaves } from "./ServicoAeronaves";
import { ServicoAerovias } from "./ServicoAerovias";
import { ServicoPilotos } from "./ServicoPilotos";
import { ServicoPlanos } from "./ServicoPlanos";
import { OcupacaoAerovia } from "./OcupacaoAerovia";
import { PlanoDeVoo } from "./PlanoDeVoo";

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
        const horaConsulta = parseInt(horario[0]);
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
                                    if (slot === horaConsulta) {
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

    /**
     * Submete um plano de voo para aprovação.
     */
    aprovarPlanoDeVoo() {
        // Definição dos dados (entrada de usuário)
        const matriculaPiloto = String(prompt('Matrícula do piloto: '));
        if (matriculaPiloto.toLowerCase() === 'q') return;
        
        // Aeronave
        while (true) {
            let pfxAeronave = String(prompt('Prefixo da aeronave: '));
            if (pfxAeronave.toLowerCase() === 'q') return;
            let aeronave = this.#servicoAeronaves.recupera(pfxAeronave);
            if (aeronave === null) {
                console.error(`Os dados da aeronave prefixo '${pfxAeronave}' estão corrompidos na base de dados!\nEspecifique um prefixo diferente.`);
                continue;
            } else if (aeronave) {
                console.error('Prefixo de aeronave não encontrado!');
            }
            break;
        }
        
        // Aerovia
        while (true) {
            let idAerovia = String(prompt('Número identificador da aerovia: '));
            if (idAerovia.toLowerCase() === 'q') return;
            let aerovia = this.#servicoAerovias.recuperaId(idAerovia);
            if (!aerovia) {
                console.error('ID de aerovia não encontrado!');
            } 
            break;
        }
            
        // Data
        while (true) {
            let data = String(prompt('Data de execução (dd/mm/aaaa, digite \'p\' para o dia de hoje): '));
            if (data.toLowerCase() === 'q') return;
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

        // Horário
        while (true) {
            let horario = String(prompt('Hora a ser consultada (hh:mm, ex "13:56"): '));
            if (horario.toLowerCase() === 'q') return;
            if ((horario.split(':')).length !== 2) {
                console.error(`Entrada de hora "${horario}" é inválida! Tente novamente. => DD/MM/AAAA`);
                continue;
            }
            break;
        }
        const altitude = Number(prompt('Altitude de voo: '));
        if (altitude.toLowerCase() === 'q') return;

        // Calculando os slots ocupados
        let slotsCount = Math.ceil(aerovia.tamanho / aeronave.velocidadeCruzeiro);
        let slots = [];
        const minutos = parseInt(horario[1]);
        for (let i = 0; (minutos === 0 ? (i < slotsCount) : (i <= slotsCount)); i++) {
            slots[i] = parseInt(horario[0]) + i;
        }

        // Criando e registrando o plano de voo
        const stringOrgIdHash = matriculaPiloto + pfxAeronave + idAerovia + data.toUTCString() + horario;
        const idPlanoDeVoo = this.#servicoPlanos.generateId(stringOrgIdHash);
        try {
            let planoDeVoo = new PlanoDeVoo(idPlanoDeVoo, matriculaPiloto, pfxAeronave, idAerovia, data, horario, altitude, slots, false);
            this.#servicoPlanos.consiste(planoDeVoo).then((retorno) => {
                if (retorno) {
                    console.log(`Plano de voo registrado com sucesso!\n\tIDENTIFICADOR => ${retorno}`);
                } else {
                    throw Error('O registro retornou erro.');
                }
            });
        } catch (err) {
            console.error(`Não foi possível aprovar o plano de voo, tente novamente. Exception: "${err}".`);
        }
    }

    /**
     * Lista um plano de voo a partir de seu ID.
     * 
     * Exibe informações de um plano de voo a partir de seu identificador
     * numérico dentro da base de dados.
     */
    listarPlanos() {
        const idPlanoDeVoo = String(prompt('Informe o ID do plano: '));
        let planoDeVoo = this.#servicoPlanos.recupera(idPlanoDeVoo);
        if (planoDeVoo) {
            console.log(`ID "${planoDeVoo.id}"`);
            console.log(`\tMatrícula Piloto => ${planoDeVoo.matriculaPiloto}`);
            console.log(`\tPrefixo Aeronave => ${planoDeVoo.pfxAeronave}`);
            console.log(`\tID Aerovia \t\t=> ${planoDeVoo.idAerovia}`);
            console.log(`\tData \t\t\t=> ${planoDeVoo.data.toLocaleDateString()}`);
            console.log(`\tHorário \t\t\t=> ${planoDeVoo.horario}`);
            console.log(`\tAltitude \t\t=> ${planoDeVoo.altitude}`);
            console.log(`\tSlots em uso \t=> ${planoDeVoo.slots}`);
            console.log(`\tCancelado? \t\t=> ${planoDeVoo.cancelado ? 'Sim' : 'Não'}`);
        } else {
            console.error('Plano de voo não encontrado!');
        }
        
    }

    listarOcupacao() {

    }

    cancelarPlano() {

    }

    sair() {

    }
}