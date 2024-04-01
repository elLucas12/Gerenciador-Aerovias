import promptsync from "prompt-sync";
const prompt = promptsync({sigint: true});

import { ServicoAeronaves } from "./ServicoAeronaves.js";
import { ServicoAerovias } from "./ServicoAerovias.js";
import { ServicoPilotos } from "./ServicoPilotos.js";
import { ServicoPlanos } from "./ServicoPlanos.js";
import { OcupacaoAerovia } from "./OcupacaoAerovia.js";
import { PlanoDeVoo } from "./PlanoDeVoo.js";
import { validate } from "bycontract";

/**
 * Classe utilizada para realizar operações relacionadas ao sistema e base de dados
 * com o acolhimento de opções de menu.
 */
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
        if (origem.toLowerCase() === 'q') return;
        let destino = String(prompt('Qual o destino? '));
        if (destino.toLowerCase() === 'q') return;
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
    async listarAltitudesLivres() {
        let idAerovia = String(prompt('Qual o ID da aerovia? '));
        if (idAerovia.toLowerCase() === 'q') return;
        let aerovia = this.#servicoAerovias.recuperaId(idAerovia);
        if (aerovia === null) {
            console.error(`Aerovia "${idAerovia}" está corrompida!`);
            return;
        } else if (!aerovia) {
            console.error("Não foi possível achar a aerovia");
            return;
        }

        let horario;
        let data;
        while (true) {
            horario = String(prompt('Hora a ser consultada (hh:mm, ex "13:56"): '));
            if (horario.toLowerCase() === 'q') return;
            horario = horario.split(':');
            let hora = parseInt(horario[0]);
            let min = parseInt(horario[1]);
            if (horario.length !== 2 || hora >= 24 || hora < 0 || min >= 60 || min < 0) {
                console.error(`Entrada de hora "${horario}" é inválida! Tente novamente.`);
                continue;
            } else {
                break;
            }
        }
        while (true) {
            data = String(prompt('Data de consulta (dd/mm/aaaa, digite \'p\' para o dia de hoje): '));
            if (data.toLowerCase() === 'q') return;
            if (data === 'p') {
                data = new Date();
                data = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            } else {
                try {
                    data = data.split('/').map((str) => {
                        return parseInt(str);
                    });
                    if (data.length === 3) {
                        data = new Date(data[2], data[1]-1, data[0]);
                    } else {
                        throw Error('Formato de data inválido, padrão=DD/MM/AAAA');
                    }
                } catch (err) {
                    console.error(`Falha da criação da data. Exception=${err}`);
                    continue;
                }
            }
            break;
        }

        // Busca e compara os valores
        const horaConsulta = parseInt(horario[0]);
        await this.#servicoPlanos.todos(0).then((planosDeVoo) => {
            let ocupacaoAltitudes = new Map();
            if (planosDeVoo[0] === '' || planosDeVoo.length === 0) {
                for (let altitude = 25000; altitude < 35000; altitude += 1000) {
                    ocupacaoAltitudes.set(altitude, false);
                }
            } else {
                for (let altitude = 25000; altitude < 35000; altitude += 1000) {
                    ocupacaoAltitudes.set(altitude, false);
                    for (let planoDeVoo of planosDeVoo) {
                        // Verifica se está cancelado
                        if (!planoDeVoo.cancelado) {
                            // Verifica ID da aerovia
                            if (planoDeVoo.idAerovia.toLowerCase() === idAerovia) {
                                // Verifica a data de consulta
                                if (planoDeVoo.data.getTime() === data.getTime()) {
                                    // Verifica o valor de altitude
                                    if (planoDeVoo.altitude === altitude) {
                                        // verifica o horário da consulta
                                        for (let slot of planoDeVoo.slots) {
                                            if (slot === horaConsulta) {
                                                ocupacaoAltitudes.set(altitude, true);
                                            }
                                        }
                                        if (ocupacaoAltitudes.get(altitude)) break;
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // output de dados
            console.log('As seguinte altitudes estão LIVRES:');
            for (const nOcupada of ocupacaoAltitudes.entries()) {
                if (!nOcupada[1]) {
                    console.log(`\t${nOcupada[0]} pés`);
                }
            }
        });
    }

    /**
     * Submete um plano de voo para aprovação.
     */
    async aprovarPlanoDeVoo() {
        // Definição dos dados (entrada de usuário)
        let matriculaPiloto;
        while (true) {
            matriculaPiloto = String(prompt('Matrícula do piloto: '));
            if (matriculaPiloto.toLowerCase() === 'q') return;
            let piloto = this.#servicoPilotos.recupera(matriculaPiloto);
            if (!piloto) {
                console.error('Piloto não encontrado!');
                continue;
            }
            break;
        }
        
        // Aeronave
        let pfxAeronave;
        let aeronave;
        while (true) {
            pfxAeronave = String(prompt('Prefixo da aeronave: '));
            if (pfxAeronave.toLowerCase() === 'q') return;
            aeronave = this.#servicoAeronaves.recupera(pfxAeronave);
            if (aeronave === null) {
                console.error(`Os dados da aeronave prefixo '${pfxAeronave}' estão corrompidos na base de dados!\nEspecifique um prefixo diferente.`);
                continue;
            } else if (!aeronave) {
                console.error('Prefixo de aeronave não encontrado!');
                continue;
            }
            break;
        }
        
        // Aerovia
        let idAerovia;
        let aerovia;
        while (true) {
            idAerovia = String(prompt('Número identificador da aerovia: '));
            if (idAerovia.toLowerCase() === 'q') return;
            aerovia = this.#servicoAerovias.recuperaId(idAerovia);
            if (!aerovia) {
                console.error('ID de aerovia não encontrado!');
                continue;
            } 
            break;
        }
            
        // Data
        let data;
        while (true) {
            data = String(prompt('Data de execução (dd/mm/aaaa, digite \'p\' para o dia de hoje): '));
            if (data.toLowerCase() === 'q') return;
            if (data === 'p') {
                data = new Date();
            } else {
                try {
                    data = data.split('/').map((str) => {
                        return parseInt(str);
                    });
                    if (data.length === 3) {
                        data = new Date(data[2], data[1]-1, data[0]);
                    } else {
                        throw Error('Formato de data inválido, padrão=DD/MM/AAAA');
                    }
                } catch (err) {
                    console.error(`Falha da criação da data. Exception=${err}`);
                    continue;
                }
            }
            break;
        }

        // Horário
        let horario;
        let horas;
        let minutos;
        while (true) {
            horario = String(prompt('Hora a ser consultada (hh:mm, ex "13:56"): '));
            if (horario.toLowerCase() === 'q') return;
            horario = horario.split(':');
            if (horario.length === 2) {
                horas = parseInt(horario[0]);
                minutos = parseInt(horario[1]);
                if (horas >= 0 && horas <= 23 || minutos >= 0 && minutos <= 59) {
                    break;
                } else {
                    console.error('O horário passado é inválido, passe uma hora válida!');
                    continue;
                }
            } else {
                console.error(`Padrão de horário "${horario}" é inválido! Entre com o padrão "HH:MM"`);
                continue;
            }
        }
        
        // Altitude & Slots
        let altitude;
        let slotsCount;
        let slots;
        while (true) {
            slotsCount = 0;
            slots = [];

            // uinput altitude
            altitude = String(prompt('Altitude de voo: '));
            if (altitude.toLowerCase() === 'q') return;
            altitude = parseInt(altitude);

            // Calculando os slots
            slotsCount = Math.ceil(aerovia.tamanho / aeronave.velocidadeCruzeiro);
            for (let i = 0; (minutos === 0 ? (i < slotsCount) : (i <= slotsCount)); i++) {
                slots[i] = horas + i;
            }

            // Verificando a ocupação de altitude conforme aerovia
            let isOcupado = false;
            for (let slot of slots) {
                if (this.#ocupacaoAerovias.isOcupado(idAerovia, data, altitude, slot)) {
                    isOcupado = true;
                    break;
                }
            }
            if (isOcupado) {
                console.log('Essa altitude está ocupada!');
                continue;
            }
            break;
        }

        // Criando e registrando o plano de voo
        const stringOrgIdHash = matriculaPiloto + pfxAeronave + idAerovia + data.toUTCString() + horario;
        const idPlanoDeVoo = await this.#servicoPlanos.generateId(stringOrgIdHash);
        try {
            let planoDeVoo = new PlanoDeVoo(idPlanoDeVoo, matriculaPiloto, pfxAeronave, idAerovia, data, horario.join(':'), altitude, slots, false);
            await this.#servicoPlanos.consiste(planoDeVoo).then((retorno) => {
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
     * Lista um plano de voo a partir de seu ID ou de uma determinada data.
     * 
     * Exibe informações de um plano de voo a partir de seu identificador
     * numérico dentro da base de dados ou os planos de voo em determinada data. 
     * 
     * @param {Boolean} aPartirDaData Se a listagem deve ocorrer a partir da data.
     * 
     * Se o parametro for false, será consultado apenas um plano de voo - isso
     * ocorrerá a partir do ID que será passado pelo usuário.
     */
    async listarPlanos(aPartirDaData=false) {
        validate(arguments, ['Boolean=']);
        if (aPartirDaData) {
            let data;
            while (true) {
                data = String(prompt('Data de consulta (dd/mm/aaaa, digite \'p\' para o dia de hoje): '));
                if (data.toLowerCase() === 'q') return;
                if (data === 'p') {
                    data = new Date();
                    data = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                } else {
                    try {
                        data = data.split('/').map((str) => {
                            return parseInt(str);
                        });
                        if (data.length === 3) {
                            data = new Date(data[2], data[1]-1, data[0]);
                        } else {
                            throw Error('Formato de data inválido, padrão=DD/MM/AAAA');
                        }
                    } catch (err) {
                        console.error(`Falha da criação da data. Exception=${err}`);
                        continue;
                    }
                }
                break;
            }

            await this.#servicoPlanos.todos(0).then((planosDeVoo) => {
                for (let planoDeVoo of planosDeVoo) {
                    if (planoDeVoo.data.getTime() === data.getTime()) {
                        if (!planoDeVoo.cancelado) {
                            let aerovia = this.#servicoAerovias.recuperaId(planoDeVoo.idAerovia);
                            if (aerovia) {
                                console.log(`\tID ${planoDeVoo.id} | orig ${aerovia.destino} | dest ${aerovia.origem}`);
                            } else {
                                console.error('Aerovia não encontrada!');
                            }
                        }
                    }
                }
            });
        } else {
            const idPlanoDeVoo = String(prompt('Informe o ID do plano: '));
            if (idPlanoDeVoo.toLowerCase() === 'q') return;
            
            await this.#servicoPlanos.recupera(idPlanoDeVoo).then((planoDeVoo) => {
                if (planoDeVoo) {
                    console.log(`ID "${planoDeVoo.id}"`);
                    console.log(`\tMatrícula Piloto => ${planoDeVoo.matriculaPiloto}`);
                    console.log(`\tPrefixo Aeronave => ${planoDeVoo.pfxAeronave}`);
                    console.log(`\tID Aerovia \t => ${planoDeVoo.idAerovia}`);
                    console.log(`\tData \t\t => ${planoDeVoo.data.toLocaleDateString('pt-BR')}`);
                    console.log(`\tHorário \t => ${planoDeVoo.horario}`);
                    console.log(`\tAltitude \t => ${planoDeVoo.altitude}`);
                    console.log(`\tSlots em uso \t => ${planoDeVoo.slots}`);
                    console.log(`\tCancelado? \t => ${planoDeVoo.cancelado ? 'Sim' : 'Não'}`);
                } else {
                    console.error('Plano de voo não encontrado!');
                }
            });
        }
    }

    /**
     * Lista a ocupação de uma aerovia em uma determina data.
     * 
     * Esse método lança para o stdout os identificadores e a origem e o destino da aerovia.
     */
    async listarOcupacao() {
        // Aerovia
        const idAerovia = String(prompt('ID Aerovia: '));
        if (idAerovia.toLowerCase() === 'q') return;
        let aerovia = this.#servicoAerovias.recuperaId(idAerovia);
        if (aerovia) {
            // Data
            let data;
            while (true) {
                data = String(prompt('Data de consulta (dd/mm/aaaa, digite \'p\' para o dia de hoje): '));
                if (data.toLowerCase() === 'q') return;
                if (data === 'p') {
                    data = new Date();
                    data = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                } else {
                    try {
                        data = data.split('/').map((str) => {
                            return parseInt(str);
                        });
                        if (data.length === 3) {
                            data = new Date(data[2], data[1]-1, data[0]);
                        } else {
                            throw Error('Formato de data inválido, padrão=DD/MM/AAAA');
                        }
                    } catch (err) {
                        console.error(`Falha da criação da data. Exception=${err}`);
                        continue;
                    }
                }
                break;
            }

            // consultando ocupação
            await this.#ocupacaoAerovias.ocupadosNaData(idAerovia, data).then((planosDeVoo) => {
                planosDeVoo.forEach((planoDeVoo) => {
                    console.log(`\tID ${planoDeVoo.id} | orig ${aerovia.origem} | dest ${aerovia.destino}`);
                });
            });
        } else {
            console.error('Aerovia não encontrada!');
        }
    }

    /**
     * Cancela um plano de voo passado pelo prompt de usuário.
     */
    async cancelarPlano() {
        let idPlanoDeVoo = String(prompt('ID do plano de voo: '));
        if (idPlanoDeVoo.toLowerCase() === 'q') return;
        await this.#servicoPlanos.cancelar(idPlanoDeVoo).then((cancelarReturn) => {
            if (cancelarReturn) {
                console.log(`O plano de voo "${idPlanoDeVoo}" foi cancelado com sucesso!`);
            } else {
                console.error(`Falha ao cancelar o plano de voo "${idPlanoDeVoo}" => Verifique se existem ocorrências na base de dados.`);
            }
        });
    }
}