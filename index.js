/**
 * Esse programa serve para auxiliar pilotos para a elaboração e aprovação de
 * seus planos de voo.
 * 
 * Os dados paralelos a interface do piloto, como as bases de dados de Aerovias, de Aeronaves
 * e de Pilotos, não são controlados por esse programa, sua administração deve ocorrer por 
 * scripts auxiliares (como mostra o programa index antigo 'index.old.js') ou manualmente no CSV.
 * 
 * Para executar os testes relacionados a esse script, execute `npm test` ou as suas alternativas
 * no arquivo de configuração. Os testes são realizados através do framework jest - definido na seção
 * devDependencies, pelo qual é possível realizar a instalação como dependência.
 * 
 * Copyright (c) 2024 Lucas Zunho (BSD-3-clause).
 */

import { Menu } from "./Menu.js";
import promptsync from "prompt-sync";
const prompt = promptsync({sigint: true});

/** Menu apresentado ao usuário (prompt) */
const menuStr = "Menu:\n\
(1) Listar aerovias entre dois pontos\n\
(2) Listar altitudes livres em aerovia\n\
(3) Submeter plano de voo para aprovação\n\
(4) Consultar plano de voo pelo ID\n\
(5) Consultar planos por data\n\
(6) Listar ocupação de aerovia por data\n\
(7) Cancelar plano de voo\n\
(0) Sair";

/** Objeto para execução das opções de menu */
let menu = new Menu();

/** Define se o loop principal deve ou não rodar */
let running = true;

console.log('Sistema de Controle de Tráfego Aéreo (SCTA) - v1.0.0\nCopyright (c) BSD-3-clause 2024');
console.log(`(Para cancelar qualquer opção de menu entre com \'q\' e Enter)`);
while (running) {
    console.log(menuStr);
    let uinput = Number(prompt(': '));
    switch(uinput) {
        case 0:
            running = false;
            break;
        case 1:
            menu.listarAerovias();
            break;
        case 2:
            await menu.listarAltitudesLivres();
            break;
        case 3:
            await menu.aprovarPlanoDeVoo();
            break;
        case 4:
            await menu.listarPlanos();
            break;
        case 5:
            await menu.listarPlanos(true);
            break;
        case 6:
            await menu.listarOcupacao();
            break;
        case 7:
            await menu.cancelarPlano();
            break;
        default:
            console.error('Opção inválida!');
            break;
    }
}