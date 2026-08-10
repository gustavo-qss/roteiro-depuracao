/**
 * derivacao.js — sorteio deterministico do algoritmo e dos valores de entrada.
 *
 * ESTE ARQUIVO E COMPARTILHADO entre o site (que mostra o codigo ao aluno) e o
 * servico de correcao (que precisa recalcular exatamente as mesmas entradas).
 * E ESM puro, sem nenhuma dependencia: da para importar tanto no Vite quanto no
 * Node (`import { derivar } from './derivacao.js'`).
 *
 * Regra de ouro: NADA aqui revela resposta. Isto so produz as ENTRADAS do
 * programa — que o aluno enxerga de qualquer jeito ao abrir o codigo no
 * IntelliJ. O gabarito (a sequencia esperada de valores) mora em
 * `validador/gabarito.mjs`, que nunca e importado pelo site.
 */

export const ALGORITMOS = ['calibrador', 'inspetor', 'ordenador']

/** Aceita "261072045", "26107-2045", "261 072 045"... e devolve so os digitos. */
export function normalizarMatricula(entrada) {
  return String(entrada ?? '').replace(/\D/g, '')
}

export function matriculaValida(entrada) {
  return /^\d{9}$/.test(normalizarMatricula(entrada))
}

/** "261072045" -> [2, 6, 1, 0, 7, 2, 0, 4, 5] */
function digitos(matricula) {
  return normalizarMatricula(matricula).split('').map(Number)
}

/**
 * Sorteio do algoritmo: soma dos 9 digitos, modulo 3.
 * Simples de propósito — voce consegue conferir na mao qual algoritmo caiu
 * para um aluno sem rodar nada.
 */
export function sortearAlgoritmo(matricula) {
  const soma = digitos(matricula).reduce((acc, d) => acc + d, 0)
  return ALGORITMOS[soma % ALGORITMOS.length]
}

/* ------------------------------------------------------------------ */
/* Valores de entrada por algoritmo                                    */
/* ------------------------------------------------------------------ */

function valoresCalibrador(d) {
  // d[7] e d[8] sao os dois ultimos digitos — os que mais variam na turma.
  const base = 12 + ((d[7] * 10 + d[8]) % 25) // 12..36
  const fator = 3 + ((d[6] + d[8]) % 5) // 3..7
  return { base, fator }
}

function valoresInspetor(d) {
  const leituras = []
  for (let i = 0; i < 5; i++) {
    leituras.push(8 + ((d[i + 4] * 9 + i * 5) % 35)) // 8..42
  }

  // Garante que `maior` seja atualizado pelo menos uma vez dentro do laco:
  // se o maximo ja estiver na posicao 0, ele nunca seria trocado e a
  // depuracao ficaria sem graca.
  const maximo = Math.max(...leituras)
  if (leituras.indexOf(maximo) === 0) {
    const troca = leituras[0]
    leituras[0] = leituras[3]
    leituras[3] = troca
  }

  return { leituras }
}

function valoresOrdenador(d) {
  const valores = []
  for (let i = 0; i < 4; i++) {
    valores.push(5 + ((d[i + 5] * 8 + i * 7) % 30)) // 5..34
  }

  // Garante que a PRIMEIRA comparacao (v[0] > v[1]) seja verdadeira, para que
  // o roteiro de passos possa acompanhar uma troca real de forma deterministica.
  if (valores[0] === valores[1]) valores[0] = valores[1] + 3
  if (valores[0] < valores[1]) {
    const troca = valores[0]
    valores[0] = valores[1]
    valores[1] = troca
  }

  return { valores }
}

const GERADORES = {
  calibrador: valoresCalibrador,
  inspetor: valoresInspetor,
  ordenador: valoresOrdenador,
}

/**
 * Ponto de entrada unico.
 * @returns {{ matricula: string, algoritmoId: string, valores: object }}
 */
export function derivar(matricula) {
  const limpa = normalizarMatricula(matricula)
  if (!matriculaValida(limpa)) {
    throw new Error(`Matricula invalida: "${matricula}" (esperado 9 digitos)`)
  }
  const algoritmoId = sortearAlgoritmo(limpa)
  return {
    matricula: limpa,
    algoritmoId,
    valores: GERADORES[algoritmoId](digitos(limpa)),
  }
}
