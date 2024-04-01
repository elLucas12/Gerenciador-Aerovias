/**
 * Script de teste das funções de consulta e listagem da classe Menu.
 * 
 * Os métodos serão testados através de funções que se assemelham com eles, mas com
 * variáveis pré definidas específicas para teste. Isso se torna necessário, uma vez que, 
 * com os requisitos do programa pedindo a manutenção do input de usuário dentro do
 * objeto Menu, tornou-se obrigatória a passagem de argumentos apenas por stdin, dificultando
 * a injeção de testes.
 * 
 * Copyright (c) 2024 Lucas Zunho (BSD-3-clause).
 */

import { ServicoAerovias } from "./ServicoAerovias.js";
import { ServicoPlanos } from "./ServicoPlanos.js";

/** Objeto para indicação de erros durante os testes */
const Erros = {
    LinhaCorrompida: 'LinhaCorrompida',
    NaoAchado: 'NaoAchado',
    EntradaInvalida: 'EntradaInvalida',
    Ocupado: 'Ocupado',
    NaoAprovado: 'NaoAprovado'
};

/**
 * Classe mínima utilizada como fantoche para testes, simulando o ambiente.
 */
class MenuTeste {
    static #servicoAerovias = new ServicoAerovias();
    static #servicoPlanos = new ServicoPlanos();

    static async listarAltitudesLivres(idAerovia, horario, data) {
        // AEROVIA
        let aerovia = MenuTeste.#servicoAerovias.recuperaId(idAerovia);
        if (aerovia === null) {
            return Erros.LinhaCorrompida;
        } else if (!aerovia) {
            return Erros.NaoAchado;
        }
        // HORARIO
        horario = horario.split(':');
        let hora = parseInt(horario[0]);
        let min = parseInt(horario[1]);
        if (horario.length !== 2 || hora >= 24 || hora < 0 || min >= 60 || min < 0) {
            return Erros.EntradaInvalida;
        } 
        // DATA
        data = data.split('/').map((str) => {
            return parseInt(str);
        });
        if (data.length === 3) {
            data = new Date(data[2], data[1]-1, data[0]);
        } else {
            return Erros.EntradaInvalida;
        }
        // COMPARACAO
        const horaConsulta = parseInt(horario[0]);
        let c = 0;
        await MenuTeste.#servicoPlanos.todos(0).then((planosDeVoo) => {
            let ocupacaoAltitudes = new Map();
            if (planosDeVoo[0] === '' || planosDeVoo.length === 0) {
                for (let altitude = 25000; altitude < 35000; altitude += 1000) {
                    ocupacaoAltitudes.set(altitude, false);
                }
            } else {
                for (let altitude = 25000; altitude < 35000; altitude += 1000) {
                    ocupacaoAltitudes.set(altitude, false);
                    for (let planoDeVoo of planosDeVoo) {
                        if (!planoDeVoo.cancelado) {
                            if (planoDeVoo.idAerovia.toLowerCase() === idAerovia) {
                                if (planoDeVoo.data.getTime() === data.getTime()) {
                                    if (planoDeVoo.altitude === altitude) {
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
            // OUTPUT
            for (const nOcupada of ocupacaoAltitudes.entries()) {
                if (!nOcupada[1]) {
                    c++;
                }
            }
        });
        return c;
    }

    static async listarPlanosData(data) {
        data = data.split('/').map((str) => { return parseInt(str); });
        if (data.length !== 3) return Erros.EntradaInvalida;
        data = new Date(data[2], data[1]-1, data[0]);

        let c = 0;
        await MenuTeste.#servicoPlanos.todos(0).then((planosDeVoo) => {
            for (let planoDeVoo of planosDeVoo) {
                if (planoDeVoo.data.getTime() === data.getTime()) {
                    if (!planoDeVoo.cancelado) {
                        let aerovia = MenuTeste.#servicoAerovias.recuperaId(planoDeVoo.idAerovia);
                        if (!aerovia) {
                            c = Erros.NaoAchado;
                            break;
                        } else {
                            c++;
                        }
                    }
                }
            }
        });
        return c;
    }
}

describe('listarAltitudesLivres', () => {
    it (`deve retornar 9 livres`, async () => {
        const idAerovia = '9675';
        const horario = '14:30';
        const data = '01/01/2025';
        const resAtual = await MenuTeste.listarAltitudesLivres(idAerovia, horario, data);
        const resEsperado = 9;
        expect(resAtual).toBe(resEsperado);
    });
    it (`deve retornar 9 livres`, async () => {
        const idAerovia = '5778';
        const horario = '12:57';
        const data = '09/11/2024';
        const resAtual = await MenuTeste.listarAltitudesLivres(idAerovia, horario, data);
        const resEsperado = 9;
        expect(resAtual).toBe(resEsperado);
    });
    it (`deve retornar "${Erros.NaoAchado}" para aerovia inexistente "4854"`, async () => {
        const idAerovia = '4854';
        const horario = '12:57';
        const data = '09/11/2024';
        const resAtual = await MenuTeste.listarAltitudesLivres(idAerovia, horario, data);
        expect(resAtual).toBe(Erros.NaoAchado);
    });
});

describe('listaPlanosData', () => {
    it (`deve retornar 1 no contador`, async () => {
        const data = '01/01/2025';
        const resEsperado = 1;
        const resAtual = await MenuTeste.listarPlanosData(data);
        expect(resAtual).toBe(resEsperado);
    });
    it (`deve retornar erro "${Erros.EntradaInvalida}" para a data`, async () => {
        const data = '28/24';
        const resAtual = await MenuTeste.listarPlanosData(data);
        expect(resAtual).toBe(Erros.EntradaInvalida);
    });
});