/**
 * Esse é um programa feito para testar a funcionalidade das classes até
 * então criadas, sendo elas: "Piloto"; "ServicoPiloto"; classes herdadas
 * de "Aeronave"; "ServicoAeronaves"; "Aerovia"; "ServicoAerovias".
 * 
 * O programa funciona através de um loop de menu, tal qual apresenta as opções
 * e realiza as chamadas necessárias através dos objetos de serviço declarados
 * no header do programa.
 * 
 * Copyright (c) 2024 Lucas Zunho (BSD-3-clause).
 */

import { AeronaveCarga } from "./AeronaveCarga.js";
import { AeronaveParticular } from "./AeronaveParticular.js";
import { AeronavePassageiros } from "./AeronavePassageiros.js";
import { ServicoAeronaves } from "./ServicoAeronaves.js";
import { ServicoAerovias } from "./ServicoAerovias.js";
import { ServicoPilotos } from "./ServicoPilotos.js";
import promptsync from "prompt-sync";

const prompt = promptsync({sigint: true});

/** Menu apresentado ao usuário (prompt) */
const menu = "Menu:\n\
(1) Pesquisar Aerovias\n\
(2) Listar Pilotos\n\
(3) Pesquisar Piloto\n\
(4) Listar Aeronaves\n\
(0) Sair";

// Objetos de serviço
let servicoAeronaves = new ServicoAeronaves();
let servicoAerovias = new ServicoAerovias();
let servicoPilotos = new ServicoPilotos();

let running = true;
while (running) {
    console.log(menu);
    let uinput = Number(prompt(": "));
    switch(uinput) {
        case 0:
            running = false;
            break;
        case 1:
            // Realiza uma consulta de aerovia através das entradas.
            let origem = String(prompt("Qual a origem da aerovia? (qualquer='n') > "));
            let destino = String(prompt("Qual o destino da aerovia? (qualquer='n') > "));
            let resAerovias = servicoAerovias.recupera(origem, destino);

            // Printando informações.
            console.log("Aerovias com essas configurações:\n\t[ ID ] | [ ORIGEM ] | [ DESTINO ]\n\t=================================");
            for (let aerovia of resAerovias) {
                console.log(`\t${aerovia.id} | ${aerovia.origem} | ${aerovia.destino}`);
            }
            break;
        case 2:
            // Lista dos pilotos presentes na base de dados.
            let resPilotos = servicoPilotos.todos();
            console.log("Pilotos Registrados:\n\t[MATRÍCULA] | [NOME] | [HAB. ATIVA]\n\t===================================");
            for (let piloto of resPilotos) {
                console.log(`\t${piloto.matricula} | ${piloto.nome} | ${(piloto.habilitacaoAtiva ? "Sim" : "Não")}`);
            }
            break;
        case 3:
            // Pesquisando piloto através da matrícula.
            let matricula = String(prompt("Qual a matrícula do piloto? "));
            let resPiloto = servicoPilotos.recupera(matricula);
            console.log(`Registro do Piloto:\n\t${resPiloto.matricula} | ${resPiloto.nome} | hab? ${(resPiloto.habilitacaoAtiva ? "Sim" : "Não")}`);
            break;
        case 4:
            // Lista de Aeronaves presentes na base de dados.
            let resAeronaves = servicoAeronaves.todas();

            // Andando pelos objetos e printando os respectivos atributos.
            console.log("=======================================");
            for (let aeronave of resAeronaves) {
                if (aeronave instanceof AeronaveCarga) {
                    /* AERONAVES DE CARGA */
                    console.log(`COMERCIAL CARGA - PFX. ${aeronave.prefixo}:`);
                    console.log(`\tVel. Cruzeiro: ${aeronave.velocidadeCruzeiro}`);
                    console.log(`\tAutonomia: ${aeronave.autonomia}`);
                    console.log(`\tCIA: ${aeronave.nomeCia}`);
                    console.log(`\tPeso Máx.: ${aeronave.pesoMax}`);
                } else if (aeronave instanceof AeronavePassageiros) {
                    /* AERONAVES DE PASSAGEIROS */
                    console.log(`COMERCIAL PASSAGEIROS - PFX. ${aeronave.prefixo}:`);
                    console.log(`\tVel. Cruzeiro: ${aeronave.velocidadeCruzeiro}`);
                    console.log(`\tAutonomia: ${aeronave.autonomia}`);
                    console.log(`\tCIA: ${aeronave.nomeCia}`);
                    console.log(`\tMáx. Passageiros: ${aeronave.maxPassageiros}`);
                } else if (aeronave instanceof AeronaveParticular) {
                    /* AERONAVE PARTICULAR */
                    console.log(`AERONAVE PARTICULAR - PFX. ${aeronave.prefixo}:`);
                    console.log(`\tVel. Cruzeiro: ${aeronave.velocidadeCruzeiro}`);
                    console.log(`\tAutonomia: ${aeronave.autonomia}`);
                    console.log(`\tResp. Manutenção: ${aeronave.respManutencao}`);
                }
            }
            console.log("=======================================");
            break;
    }
}