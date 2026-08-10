/**
 * corrigir.mjs — corrige os arquivos .json entregues pelos alunos.
 *
 * Uso:
 *   node validador/corrigir.mjs respostas/            # uma pasta inteira
 *   node validador/corrigir.mjs respostas/261072045-inspetor.json
 *   node validador/corrigir.mjs respostas/ --csv notas.csv
 *   node validador/corrigir.mjs respostas/ --detalhe  # lista cada erro
 *
 * Regras de comparacao:
 *   - numeros: comparados como inteiros, ignorando espacos;
 *   - arrays:  comparados posicao a posicao ("12, 7, 30" == "{12,7,30}");
 *   - escolhas: comparadas sem acento e sem diferenciar maiuscula/minuscula;
 *   - campos livres (observacao, conclusao) NAO entram na nota — sao apenas
 *     listados com --detalhe para voce ler.
 */

import { readdir, readFile, writeFile } from 'node:fs/promises'
import { statSync } from 'node:fs'
import { join, basename } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gabaritoPara } from './gabarito.mjs'
import { parseAlunos } from '../src/lib/csv.js'

/**
 * O site publica so "BEATRIZ K. M.", entao os envios trazem o nome curto.
 * Se o roster completo existir aqui na sua maquina, o relatorio usa o nome
 * inteiro; senao, segue com o que veio no arquivo.
 */
async function carregarNomesCompletos() {
  try {
    const caminho = fileURLToPath(new URL('./alunos-completo.csv', import.meta.url))
    return parseAlunos(await readFile(caminho, 'utf8'))
  } catch {
    return new Map()
  }
}

/* --- normalizacao -------------------------------------------------- */

function semAcento(s) {
  // ̀-ͯ = faixa dos acentos combinantes separados pelo NFD
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '')
}

function normalizarTexto(v) {
  return semAcento(String(v ?? '').trim().toLowerCase())
}

function comoInteiro(v) {
  const s = String(v ?? '').trim()
  if (/^-?\d+$/.test(s)) return Number(s)
  // Tolera coisas como "parcial = 41" ou "41 (int)".
  const achados = s.match(/-?\d+/g)
  return achados && achados.length === 1 ? Number(achados[0]) : NaN
}

function comoLista(v) {
  if (Array.isArray(v)) return v.map(Number)
  const achados = String(v ?? '').match(/-?\d+/g)
  return achados ? achados.map(Number) : null
}

function confere(esperado, dado) {
  if (dado === undefined || String(dado).trim() === '') return false

  if (Array.isArray(esperado)) {
    const lista = comoLista(dado)
    return (
      lista !== null &&
      lista.length === esperado.length &&
      lista.every((n, i) => n === esperado[i])
    )
  }

  if (typeof esperado === 'number') {
    return comoInteiro(dado) === esperado
  }

  return normalizarTexto(dado) === normalizarTexto(esperado)
}

/* --- correcao de um envio ------------------------------------------ */

function corrigirEnvio(envio, arquivo) {
  const matricula = envio?.aluno?.matricula
  if (!matricula) {
    return { arquivo, erro: 'Arquivo sem aluno.matricula' }
  }

  let gabarito
  try {
    gabarito = gabaritoPara(matricula)
  } catch (e) {
    return { arquivo, matricula, erro: e.message }
  }

  if (envio.algoritmo?.id && envio.algoritmo.id !== gabarito.algoritmoId) {
    return {
      arquivo,
      matricula,
      erro:
        `O arquivo diz que o algoritmo e "${envio.algoritmo.id}", mas a matricula ` +
        `${matricula} sorteia "${gabarito.algoritmoId}". Arquivo trocado ou editado.`,
    }
  }

  const respostas = Array.isArray(envio.respostas) ? envio.respostas : []
  const porPasso = new Map(respostas.map((r) => [r.passo, r]))

  let acertos = 0
  let total = 0
  const erros = []
  const livres = []

  gabarito.passos.forEach((esperados, i) => {
    const n = i + 1
    const dada = porPasso.get(n)

    for (const [campo, esperado] of Object.entries(esperados)) {
      total++
      const valor = dada?.campos?.[campo]
      if (confere(esperado, valor)) {
        acertos++
      } else {
        erros.push({
          passo: n,
          campo,
          esperado: Array.isArray(esperado) ? `{${esperado.join(', ')}}` : esperado,
          respondido:
            valor === undefined || String(valor).trim() === ''
              ? '(em branco)'
              : String(valor).trim(),
        })
      }
    }

    if (dada?.observacao?.trim()) {
      livres.push({ passo: n, texto: dada.observacao.trim() })
    }
    if (dada?.campos?.conclusao?.trim()) {
      livres.push({ passo: n, texto: `[conclusão] ${dada.campos.conclusao.trim()}` })
    }
  })

  return {
    arquivo,
    matricula,
    nome: envio.aluno?.nome ?? '',
    algoritmo: gabarito.algoritmoId,
    acertos,
    total,
    percentual: total ? Math.round((acertos / total) * 1000) / 10 : 0,
    erros,
    livres,
  }
}

/* --- leitura dos arquivos ------------------------------------------ */

async function coletarArquivos(alvos) {
  const arquivos = []
  for (const alvo of alvos) {
    if (statSync(alvo).isDirectory()) {
      const nomes = await readdir(alvo)
      arquivos.push(
        ...nomes.filter((n) => n.endsWith('.json')).map((n) => join(alvo, n)),
      )
    } else {
      arquivos.push(alvo)
    }
  }
  return arquivos.sort()
}

/* --- CLI ------------------------------------------------------------ */

const args = process.argv.slice(2)
const detalhe = args.includes('--detalhe')
const idxCsv = args.indexOf('--csv')
const saidaCsv = idxCsv >= 0 ? args[idxCsv + 1] : null
const alvos = args.filter(
  (a, i) => !a.startsWith('--') && !(idxCsv >= 0 && i === idxCsv + 1),
)

if (alvos.length === 0) {
  console.error('Uso: node validador/corrigir.mjs <pasta-ou-arquivo.json> [--detalhe] [--csv notas.csv]')
  process.exit(1)
}

const arquivos = await coletarArquivos(alvos)
if (arquivos.length === 0) {
  console.error('Nenhum arquivo .json encontrado.')
  process.exit(1)
}

const nomesCompletos = await carregarNomesCompletos()
const resultados = []

for (const arquivo of arquivos) {
  try {
    const envio = JSON.parse(await readFile(arquivo, 'utf8'))
    const r = corrigirEnvio(envio, arquivo)
    if (r.matricula && nomesCompletos.has(r.matricula)) {
      r.nome = nomesCompletos.get(r.matricula)
    }
    resultados.push(r)
  } catch (e) {
    resultados.push({ arquivo, erro: `JSON invalido: ${e.message}` })
  }
}

console.log('')
for (const r of resultados) {
  if (r.erro) {
    console.log(`✗ ${basename(r.arquivo)}`)
    console.log(`  ${r.erro}\n`)
    continue
  }

  const barra = '█'.repeat(Math.round(r.percentual / 5)).padEnd(20, '·')
  console.log(`${r.matricula}  ${r.nome}`)
  console.log(
    `  ${r.algoritmo.padEnd(11)} ${barra} ${r.acertos}/${r.total} (${r.percentual}%)`,
  )

  if (detalhe && r.erros.length) {
    console.log('  erros:')
    for (const e of r.erros) {
      console.log(
        `    passo ${String(e.passo).padStart(2)} · ${e.campo}: esperado ${e.esperado}, respondeu ${e.respondido}`,
      )
    }
  }
  if (detalhe && r.livres.length) {
    console.log('  texto livre:')
    for (const l of r.livres) {
      console.log(`    passo ${String(l.passo).padStart(2)}: ${l.texto}`)
    }
  }
  console.log('')
}

const validos = resultados.filter((r) => !r.erro)
if (validos.length > 1) {
  const media =
    validos.reduce((acc, r) => acc + r.percentual, 0) / validos.length
  console.log(`— ${validos.length} entregas · média ${media.toFixed(1)}%`)
}

if (saidaCsv) {
  const linhas = ['matricula,nome,algoritmo,acertos,total,percentual']
  for (const r of validos) {
    linhas.push(
      [r.matricula, `"${r.nome}"`, r.algoritmo, r.acertos, r.total, r.percentual].join(','),
    )
  }
  await writeFile(saidaCsv, linhas.join('\n') + '\n', 'utf8')
  console.log(`CSV escrito em ${saidaCsv}`)
}
