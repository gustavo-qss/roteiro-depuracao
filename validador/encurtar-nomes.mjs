/**
 * encurtar-nomes.mjs — gera o `public/alunos.csv` (que vai para o ar) a partir
 * do `validador/alunos-completo.csv` (que fica so na sua maquina).
 *
 *   BEATRIZ KRULEWSKI MARTINS  ->  BEATRIZ K. M.
 *
 * O site precisa ler a lista da turma para achar o nome pela matricula, entao o
 * arquivo publicado e legivel por qualquer um que tenha a URL. Publicando so o
 * primeiro nome + iniciais, o aluno ainda se reconhece na confirmacao, mas quem
 * baixar o CSV nao leva a lista nominal completa da turma.
 *
 * Uso:
 *   node validador/encurtar-nomes.mjs            # regrava public/alunos.csv
 *   node validador/encurtar-nomes.mjs --conferir # so mostra o resultado
 */

import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { parseAlunos } from '../src/lib/csv.js'

const ORIGEM = fileURLToPath(new URL('./alunos-completo.csv', import.meta.url))
const DESTINO = fileURLToPath(new URL('../public/alunos.csv', import.meta.url))

// Particulas que nao viram inicial ("DA SILVA" -> "S.", e nao "D. S.").
const PARTICULAS = new Set(['DE', 'DA', 'DAS', 'DO', 'DOS', 'E'])

export function encurtar(nome) {
  const partes = nome.trim().split(/\s+/)
  if (partes.length <= 1) return partes[0] ?? ''

  const iniciais = partes
    .slice(1)
    .filter((p) => !PARTICULAS.has(p.toUpperCase()))
    .map((p) => `${p[0].toUpperCase()}.`)

  return [partes[0], ...iniciais].join(' ')
}

const alunos = parseAlunos(await readFile(ORIGEM, 'utf8'))
const linhas = ['matricula,nome']
const vistos = new Map()

for (const [matricula, nome] of alunos) {
  const curto = encurtar(nome)
  if (vistos.has(curto)) {
    console.warn(
      `AVISO: "${curto}" ficou ambiguo entre ${vistos.get(curto)} e ${matricula}.`,
    )
  }
  vistos.set(curto, matricula)
  linhas.push(`${matricula},${curto}`)
}

const conteudo = linhas.join('\n') + '\n'

if (process.argv.includes('--conferir')) {
  console.log(conteudo)
} else {
  await writeFile(DESTINO, conteudo, 'utf8')
  console.log(`${alunos.size} alunos escritos em public/alunos.csv`)
}
