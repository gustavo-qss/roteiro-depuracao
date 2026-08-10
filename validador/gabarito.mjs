/**
 * gabarito.mjs — simula os tres algoritmos e produz a sequencia ESPERADA de
 * valores, passo a passo, a partir da matricula.
 *
 * Este arquivo NAO e importado pelo site: se ele entrasse no bundle, o aluno
 * acharia as respostas abrindo o DevTools. Ele existe para o servico de
 * correcao (e para voce conferir um caso na mao).
 *
 * Uso:
 *   node validador/gabarito.mjs 261072045
 *   node validador/gabarito.mjs 261072045 --json
 *
 * As chaves de cada passo sao exatamente os `id` dos campos declarados em
 * src/core/algoritmos.js — e assim que a correcao casa uma coisa com a outra.
 */

import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import { derivar } from '../src/core/derivacao.js'

/** Divisao inteira do Java (trunca em direcao ao zero). */
const divInt = (a, b) => Math.trunc(a / b)

const simNao = (b) => (b ? 'Sim' : 'Não')
const trueFalse = (b) => (b ? 'true' : 'false')

/* ================================================================== */

function gabaritoCalibrador({ base, fator }) {
  const parcial = base * fator
  const extra = parcial + 7
  const bruto = extra
  const reduzido = bruto - fator
  const ajustado = divInt(reduzido, 2)
  const limpo = ajustado
  const resultado = limpo

  return [
    { base, fator },
    { x: base, y: fator },
    { n1: base, n2: fator },
    { parcial },
    { z: parcial },
    { retorno_compensar: extra, extra_definido: 'Não' },
    { parcial, extra },
    { retorno_combinar: extra },
    { x: base, y: fator, bruto },
    { valor: bruto, passo: fator },
    { reduzido },
    { ajustado, entrou_arredondar: 'Não' },
    { retorno_normalizar: ajustado },
    { bruto, limpo },
    { retorno_calibrar: limpo, resultado_definido: 'Não' },
    { resultado },
    { saida_console: resultado },
  ]
}

/* ================================================================== */

function gabaritoInspetor({ leituras }) {
  const v = [...leituras]

  // maiorApos[k] = maior valor entre v[0..k]
  const maiorApos = []
  let corrente = v[0]
  for (let k = 0; k < v.length; k++) {
    if (v[k] > corrente) corrente = v[k]
    maiorApos[k] = corrente
  }

  const maiorFinal = maiorApos[v.length - 1]
  const quantidade = v.length
  const soma = maiorFinal + quantidade
  const dobro = soma * 2

  // Passos das paradas 2a, 3a e 4a do BP2 (i = 2, 3, 4)
  const voltas = [2, 3, 4].map((i) => ({
    i,
    v_i: v[i],
    maior: maiorApos[i - 1],
    atualiza: simNao(v[i] > maiorApos[i - 1]),
  }))

  return [
    { leituras: v },
    { dados: v },
    { v },
    { maior: v[0] },
    { i: 1, v_i: v[1], maior: v[0] },
    {
      candidato: v[1],
      atual: v[0],
      retorno_ehMaior: trueFalse(v[1] > v[0]),
    },
    { entra_no_if: simNao(v[1] > v[0]) },
    voltas[0],
    voltas[1],
    voltas[2],
    {
      valor: maiorFinal,
      quantidade,
      por_que_pulou: 'O laco terminou: i chegou a v.length',
    },
    { soma },
    { z: soma },
    { retorno_dobrar: dobro },
    { maior: maiorFinal, retorno_ajustar: dobro },
    { ajustado: dobro },
    { retorno_analisar: dobro },
    { resultado: dobro },
    { saida_console: dobro },
  ]
}

/* ================================================================== */

function gabaritoOrdenador({ valores }) {
  const inicial = [...valores]
  const v = [...valores]

  // i = 0 — a derivacao garante que esta comparacao e verdadeira.
  const temp = v[0]
  const noMeioDaTroca = [v[1], v[1], v[2], v[3]] // depois de v[0] = v[1]
  v[0] = v[1]
  v[1] = temp
  const depoisDaTroca = [...v]
  let trocas = 1

  // i = 1
  const volta1 = { i: 1, v_i: v[1], v_i1: v[2], troca: v[1] > v[2] }
  if (volta1.troca) {
    const t = v[1]
    v[1] = v[2]
    v[2] = t
    trocas++
  }

  // i = 2
  const volta2 = { i: 2, v_i: v[2], v_i1: v[3], troca: v[2] > v[3] }
  if (volta2.troca) {
    const t = v[2]
    v[2] = v[3]
    v[3] = t
    trocas++
  }

  const final = [...v]
  const ultimo = final[final.length - 1]
  const resultado = ultimo * 10 + trocas

  return [
    { valores: inicial },
    { v: inicial },
    { v: inicial },
    { trocas: 0 },
    { i: 0, v_i: inicial[0], v_i1: inicial[1] },
    {
      esquerda: inicial[0],
      direita: inicial[1],
      retorno_foraDeOrdem: 'true',
    },
    { proxima_linha: 'trocar(v, i);' },
    { v: inicial },
    { i: 0, v: inicial },
    { temp },
    { v: noMeioDaTroca },
    { v: depoisDaTroca, void_devolve: 'Não' },
    { v: depoisDaTroca, trocas: 0 },
    { trocas: 0 },
    {
      i: volta1.i,
      v_i: volta1.v_i,
      v_i1: volta1.v_i1,
      vai_trocar: simNao(volta1.troca),
    },
    {
      i: volta2.i,
      v_i: volta2.v_i,
      v_i1: volta2.v_i1,
      vai_trocar: simNao(volta2.troca),
    },
    { v: final, trocas },
    { ultimo },
    { a: ultimo, b: trocas },
    { retorno_combinar: resultado },
    { trocas, retorno_pontuar: resultado },
    { retorno_processar: resultado },
    { resultado },
    { saida_console: resultado },
  ]
}

/* ================================================================== */

const SIMULADORES = {
  calibrador: gabaritoCalibrador,
  inspetor: gabaritoInspetor,
  ordenador: gabaritoOrdenador,
}

/**
 * @returns {{ matricula, algoritmoId, valores, passos: object[] }}
 *          `passos[i]` traz os valores esperados do passo i+1.
 */
export function gabaritoPara(matricula) {
  const { algoritmoId, valores, matricula: limpa } = derivar(matricula)
  return {
    matricula: limpa,
    algoritmoId,
    valores,
    passos: SIMULADORES[algoritmoId](valores),
  }
}

/* --- CLI ----------------------------------------------------------- */

const executadoDireto =
  process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (executadoDireto) {
  const matricula = process.argv[2]
  if (!matricula) {
    console.error('Uso: node validador/gabarito.mjs <matricula> [--json]')
    process.exit(1)
  }

  const g = gabaritoPara(matricula)

  if (process.argv.includes('--json')) {
    console.log(JSON.stringify(g, null, 2))
  } else {
    console.log(`Matricula .... ${g.matricula}`)
    console.log(`Algoritmo .... ${g.algoritmoId}`)
    console.log(`Entradas ..... ${JSON.stringify(g.valores)}`)
    console.log('')
    g.passos.forEach((p, i) => {
      const campos = Object.entries(p)
        .map(([k, val]) => `${k}=${Array.isArray(val) ? `{${val.join(', ')}}` : val}`)
        .join('  ')
      console.log(`${String(i + 1).padStart(2, ' ')}. ${campos}`)
    })
  }
}
