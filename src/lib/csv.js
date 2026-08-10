import { normalizarMatricula } from '../core/derivacao.js'

/**
 * Parser de CSV pequeno e suficiente para o formato "matricula,nome".
 * Aceita aspas duplas e o BOM que o Excel/Google Planilhas costuma deixar.
 */
function separarLinha(linha) {
  const celulas = []
  let atual = ''
  let dentroDeAspas = false

  for (let i = 0; i < linha.length; i++) {
    const c = linha[i]
    if (dentroDeAspas) {
      if (c === '"' && linha[i + 1] === '"') {
        atual += '"'
        i++
      } else if (c === '"') {
        dentroDeAspas = false
      } else {
        atual += c
      }
    } else if (c === '"') {
      dentroDeAspas = true
    } else if (c === ',' || c === ';') {
      celulas.push(atual)
      atual = ''
    } else {
      atual += c
    }
  }
  celulas.push(atual)
  return celulas.map((c) => c.trim())
}

export function parseAlunos(texto) {
  const linhas = texto
    .replace(/^﻿/, '')
    .split(/\r?\n/)
    .filter((l) => l.trim() !== '')

  const alunos = new Map()

  for (const linha of linhas) {
    const [bruto, nome] = separarLinha(linha)
    const matricula = normalizarMatricula(bruto)
    // Ignora o cabecalho e qualquer linha sem matricula de 9 digitos.
    if (!/^\d{9}$/.test(matricula) || !nome) continue
    alunos.set(matricula, nome)
  }

  return alunos
}

export async function carregarAlunos(url) {
  const resposta = await fetch(url, { cache: 'no-cache' })
  if (!resposta.ok) {
    throw new Error(`Nao foi possivel carregar a lista de alunos (${resposta.status})`)
  }
  return parseAlunos(await resposta.text())
}
