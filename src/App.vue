<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { carregarAlunos } from './lib/csv.js'
import { derivar } from './core/derivacao.js'
import { algoritmoPorId, passosNumerados } from './core/algoritmos.js'

import EtapaIdentificacao from './components/EtapaIdentificacao.vue'
import EtapaPreparo from './components/EtapaPreparo.vue'
import EtapaPassos from './components/EtapaPassos.vue'
import EtapaConclusao from './components/EtapaConclusao.vue'

const ETAPAS = [
  { id: 'identificacao', rotulo: 'Identificação' },
  { id: 'preparo', rotulo: 'Preparação' },
  { id: 'passos', rotulo: 'Depuração' },
  { id: 'conclusao', rotulo: 'Entrega' },
]

const VERSAO = 1

const etapa = ref('identificacao')
const alunos = ref(new Map())
const erroCarga = ref('')
const carregando = ref(true)

const aluno = ref(null) // { matricula, nome }
const respostas = ref([]) // [{ campos: {...}, observacao: '' }]
const iniciadoEm = ref(null)

const derivado = computed(() => (aluno.value ? derivar(aluno.value.matricula) : null))
const algoritmo = computed(() =>
  derivado.value ? algoritmoPorId(derivado.value.algoritmoId) : null,
)
const passos = computed(() =>
  derivado.value ? passosNumerados(derivado.value.algoritmoId) : [],
)
const codigo = computed(() =>
  algoritmo.value ? algoritmo.value.codigo(derivado.value.valores) : '',
)

const indiceEtapa = computed(() => ETAPAS.findIndex((e) => e.id === etapa.value))

/* --- persistencia local ------------------------------------------- */

const chave = computed(() =>
  aluno.value ? `depuracao:v${VERSAO}:${aluno.value.matricula}` : null,
)

function salvar() {
  if (!chave.value) return
  try {
    localStorage.setItem(
      chave.value,
      JSON.stringify({
        etapa: etapa.value,
        respostas: respostas.value,
        iniciadoEm: iniciadoEm.value,
      }),
    )
  } catch {
    /* modo privativo / cota cheia: seguir sem persistir */
  }
}

function restaurar(matricula) {
  try {
    const bruto = localStorage.getItem(`depuracao:v${VERSAO}:${matricula}`)
    return bruto ? JSON.parse(bruto) : null
  } catch {
    return null
  }
}

watch([etapa, respostas], salvar, { deep: true })

/* --- ciclo de vida ------------------------------------------------- */

onMounted(async () => {
  try {
    alunos.value = await carregarAlunos(`${import.meta.env.BASE_URL}alunos.csv`)
    if (alunos.value.size === 0) {
      erroCarga.value = 'A lista de alunos está vazia. Avise o professor.'
    }
  } catch (e) {
    erroCarga.value = e.message
  } finally {
    carregando.value = false
  }
})

/* --- transicoes ---------------------------------------------------- */

function confirmarAluno(selecionado) {
  aluno.value = selecionado

  const salvo = restaurar(selecionado.matricula)
  const total = passos.value.length

  if (salvo && Array.isArray(salvo.respostas) && salvo.respostas.length === total) {
    respostas.value = salvo.respostas
    iniciadoEm.value = salvo.iniciadoEm ?? new Date().toISOString()
    etapa.value = salvo.etapa === 'identificacao' ? 'preparo' : salvo.etapa
  } else {
    respostas.value = passos.value.map(() => ({ campos: {}, observacao: '' }))
    iniciadoEm.value = new Date().toISOString()
    etapa.value = 'preparo'
  }

  rolarAoTopo()
}

function irPara(destino) {
  etapa.value = destino
  rolarAoTopo()
}

function recomecar() {
  if (
    !confirm(
      'Isto apaga todas as respostas já preenchidas e volta para a tela inicial. Continuar?',
    )
  ) {
    return
  }
  if (chave.value) {
    try {
      localStorage.removeItem(chave.value)
    } catch {
      /* ignora */
    }
  }
  aluno.value = null
  respostas.value = []
  iniciadoEm.value = null
  etapa.value = 'identificacao'
  rolarAoTopo()
}

function rolarAoTopo() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <header class="topo">
    <div class="coluna topo__interno">
      <div>
        <p class="topo__disciplina">Análise e Projeto de Algoritmos</p>
        <h1 class="topo__titulo">Roteiro de Depuração</h1>
      </div>
      <p class="topo__meta">
        Atividade individual<br />
        Depuração e documentação de código
      </p>
    </div>
    <div class="topo__regua" aria-hidden="true"></div>
  </header>

  <nav v-if="aluno" class="trilha" aria-label="Progresso da atividade">
    <ol class="coluna trilha__lista">
      <li
        v-for="(e, i) in ETAPAS"
        :key="e.id"
        class="trilha__item"
        :class="{
          'trilha__item--atual': i === indiceEtapa,
          'trilha__item--feito': i < indiceEtapa,
        }"
      >
        <span class="trilha__n">{{ i + 1 }}</span>
        <span class="trilha__rotulo">{{ e.rotulo }}</span>
      </li>
    </ol>
  </nav>

  <main class="coluna conteudo">
    <p v-if="carregando" class="estado">Carregando a lista da turma…</p>

    <div v-else-if="erroCarga" class="cartao estado-erro">
      <h2>Não foi possível carregar a turma</h2>
      <p>{{ erroCarga }}</p>
    </div>

    <EtapaIdentificacao
      v-else-if="etapa === 'identificacao'"
      :alunos="alunos"
      @confirmar="confirmarAluno"
    />

    <EtapaPreparo
      v-else-if="etapa === 'preparo'"
      :aluno="aluno"
      :algoritmo="algoritmo"
      :codigo="codigo"
      @avancar="irPara('passos')"
      @voltar="recomecar"
    />

    <EtapaPassos
      v-else-if="etapa === 'passos'"
      :algoritmo="algoritmo"
      :codigo="codigo"
      :passos="passos"
      :respostas="respostas"
      @concluir="irPara('conclusao')"
      @voltar="irPara('preparo')"
    />

    <EtapaConclusao
      v-else-if="etapa === 'conclusao'"
      :aluno="aluno"
      :algoritmo="algoritmo"
      :derivado="derivado"
      :passos="passos"
      :respostas="respostas"
      :iniciado-em="iniciadoEm"
      :versao="VERSAO"
      @revisar="irPara('passos')"
      @recomecar="recomecar"
    />
  </main>

  <footer class="rodape">
    <div class="coluna rodape__interno">
      <span>UniFil · Ciência da Computação</span>
      <span v-if="aluno" class="rodape__aluno">
        {{ aluno.nome }} · {{ aluno.matricula }}
      </span>
    </div>
  </footer>
</template>

<style scoped>
.topo {
  background: var(--superficie);
  border-bottom: 1px solid var(--filete);
}

.topo__interno {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 2rem;
  padding-top: 1.6rem;
  padding-bottom: 1.1rem;
}

.topo__disciplina {
  margin: 0 0 0.15rem;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--tinta-3);
}

.topo__titulo {
  font-size: 1.65rem;
}

.topo__meta {
  margin: 0;
  text-align: right;
  font-size: 0.75rem;
  line-height: 1.5;
  color: var(--tinta-3);
}

/* filete duplo, como em folha de rosto impressa */
.topo__regua {
  height: 3px;
  border-top: 1px solid var(--azul);
  border-bottom: 1px solid var(--azul);
  background: transparent;
  opacity: 0.35;
}

.trilha {
  background: var(--superficie-2);
  border-bottom: 1px solid var(--filete);
}

.trilha__lista {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  list-style: none;
  margin: 0;
  padding-top: 0.7rem;
  padding-bottom: 0.7rem;
}

.trilha__item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
  color: var(--tinta-3);
}

.trilha__n {
  display: grid;
  place-items: center;
  width: 1.25rem;
  height: 1.25rem;
  border: 1px solid var(--filete-forte);
  border-radius: 2px;
  font-size: 0.6875rem;
  font-variant-numeric: tabular-nums;
}

.trilha__item--atual {
  color: var(--azul);
  font-weight: 600;
}
.trilha__item--atual .trilha__n {
  border-color: var(--azul);
  background: var(--azul);
  color: #fff;
}

.trilha__item--feito {
  color: var(--tinta-2);
}
.trilha__item--feito .trilha__n {
  border-color: var(--azul-filete);
  background: var(--azul-claro);
  color: var(--azul);
}

.conteudo {
  padding-top: 2.25rem;
  padding-bottom: 3.5rem;
}

.estado {
  color: var(--tinta-3);
  font-size: 0.9375rem;
}

.estado-erro h2 {
  margin-bottom: 0.5rem;
}

.rodape {
  border-top: 1px solid var(--filete);
  background: var(--superficie);
}

.rodape__interno {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  padding-top: 1rem;
  padding-bottom: 1rem;
  font-size: 0.75rem;
  color: var(--tinta-3);
}

.rodape__aluno {
  font-family: var(--mono);
}

@media (max-width: 640px) {
  .topo__interno {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  .topo__meta {
    text-align: left;
  }
  .trilha__lista {
    gap: 0.85rem;
  }
  .trilha__rotulo {
    display: none;
  }
  .trilha__item--atual .trilha__rotulo {
    display: inline;
  }
}
</style>
