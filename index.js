/**
 * Esse programa serve para auxiliar pilotos para a elaboração e aprovação de
 * seus planos de voo.
 * 
 * Os dados paralelos a interface do piloto, como as bases de dados de Aerovias, de Aeronaves
 * e de Pilotos, não são controlados por esse programa, sua administração deve ocorrer por 
 * scripts auxiliares (como mostra o programa index antigo 'index.old.js') ou manualmente no CSV.
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
(0) Sair\n\
: ";

/** Objeto para execução das opções de menu */
let menu = new Menu();

/** Define se o loop principal deve ou não rodar */
let running = true;

console.log('Sistema de Controle de Tráfego Aéreo (SCTA) - v1.0.0\nCopyright (c) BSD-3-clause 2024');
while (running) {
    let uinput = Number(prompt(menuStr));
    switch(uinput) {
        case 0:
            running = false;
            break;
        case 1:
            menu.listarAerovias();
            break;
        case 2:
            menu.listarAltitudesLivres();
            break;
        case 3:
            menu.aprovarPlanoDeVoo();
            break;
        case 4:
            menu.listarPlanos();
            break;
        case 5:
            menu.listarPlanos(true);
            break;
        case 6:
            menu.listarOcupacao();
            break;
        case 7:
            menu.cancelarPlano();
            break;
        default:
            console.error('Opção inválida!');
            break;
    }
}