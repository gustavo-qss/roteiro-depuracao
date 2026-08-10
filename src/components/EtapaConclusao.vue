<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  aluno: { type: Object, required: true },
  algoritmo: { type: Object, required: true },
  derivado: { type: Object, required: true },
  passos: { type: Array, required: true },
  respostas: { type: Array, required: true },
  iniciadoEm: { type: String, default: null },
  versao: { type: Number, default: 1 },
})

const emit = defineEmits(['revisar', 'recomecar'])

const baixado = ref(false)

const incompletos = computed(() =>
  props.passos
    .map((p, i) => ({
      n: p.n,
      local: p.local,
      faltando: p.campos.filter((c) => {
        const v = props.respostas[i].campos[c.id]
        return v === undefined || String(v).trim() === ''
      }).length,
    }))
    .filter((p) => p.faltando > 0),
)

const nomeArquivo = computed(
  () => `${props.aluno.matricula}-${props.algoritmo.id}.json`,
)

function montarEnvio() {
  return {
    versao: props.versao,
    geradoEm: new Date().toISOString(),
    iniciadoEm: props.iniciadoEm,
    aluno: {
      matricula: props.aluno.matricula,
      nome: props.aluno.nome,
    },
    algoritmo: {
      id: props.algoritmo.id,
      classe: props.algoritmo.classe,
    },
    valores: props.derivado.valores,
    respostas: props.passos.map((p, i) => ({
      passo: p.n,
      local: p.local,
      linha: p.linha,
      acao: p.acao ? p.acao.nome : null,
      campos: { ...props.respostas[i].campos },
      observacao: props.respostas[i].observacao ?? '',
    })),
  }
}

function baixar() {
  const conteudo = JSON.stringify(montarEnvio(), null, 2)
  const blob = new Blob([conteudo], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nomeArquivo.value
  a.click()
  URL.revokeObjectURL(url)
  baixado.value = true
}
</script>

<template>
  <section>
    <p class="eyebrow">Etapa 4</p>
    <h2 class="titulo">Entrega</h2>
    <p class="intro">
      Você percorreu os {{ passos.length }} passos do
      <strong>{{ algoritmo.classe }}</strong
      >. Baixe o arquivo abaixo e entregue no local combinado com o professor.
    </p>

    <!-- Pendencias -->
    <div v-if="incompletos.length" class="nota nota--atencao pendencias">
      <strong>Há {{ incompletos.length }} passo(s) com campos em branco.</strong>
      Você ainda pode entregar assim, mas o que estiver vazio conta como não respondido.
      <ul class="pendencias__lista">
        <li v-for="p in incompletos" :key="p.n">
          Passo {{ p.n }} ({{ p.local }}) — {{ p.faltando }} campo(s)
        </li>
      </ul>
    </div>

    <!-- Download -->
    <div class="cartao download">
      <h3 class="download__titulo">Arquivo de respostas</h3>
      <p class="download__arquivo">{{ nomeArquivo }}</p>
      <p class="download__texto">
        O arquivo guarda sua matrícula, o algoritmo sorteado e todos os valores que você
        anotou. Não renomeie e não edite o conteúdo — a correção usa exatamente esses
        campos.
      </p>
      <div class="download__acoes">
        <button class="botao" type="button" @click="baixar">
          {{ baixado ? 'Baixar novamente' : 'Baixar respostas (.json)' }}
        </button>
        <button class="botao botao--secundario" type="button" @click="emit('revisar')">
          Revisar os passos
        </button>
      </div>
      <p v-if="baixado" class="download__ok">
        ✓ Arquivo gerado. Confira a pasta de downloads e envie no classroom.
      </p>
    </div>

    <!-- Revisao -->
    <h3 class="secao__titulo">Resumo do que você anotou</h3>
    <div class="tabela-wrap">
      <table class="revisao">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Parada</th>
            <th scope="col">Ação</th>
            <th scope="col">Valores anotados</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(p, i) in passos" :key="p.n">
            <td class="revisao__n">{{ p.n }}</td>
            <td>{{ p.local }}</td>
            <td class="revisao__acao">{{ p.acao ? p.acao.nome : '—' }}</td>
            <td>
              <ul class="valores">
                <li v-for="c in p.campos" :key="c.id">
                  <span class="valores__rotulo">{{ c.rotulo }}</span>
                  <span
                    class="valores__valor"
                    :class="{
                      'valores__valor--vazio':
                        respostas[i].campos[c.id] === undefined ||
                        String(respostas[i].campos[c.id]).trim() === '',
                    }"
                  >
                    {{
                      respostas[i].campos[c.id] !== undefined &&
                      String(respostas[i].campos[c.id]).trim() !== ''
                        ? respostas[i].campos[c.id]
                        : 'em branco'
                    }}
                  </span>
                </li>
              </ul>
              <p v-if="respostas[i].observacao" class="valores__obs">
                {{ respostas[i].observacao }}
              </p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="fim">
      <button class="botao botao--secundario" type="button" @click="emit('recomecar')">
        Apagar tudo e recomeçar
      </button>
    </div>
  </section>
</template>

<style scoped>
.titulo {
  margin-bottom: 0.6rem;
}

.intro {
  max-width: 44rem;
  color: var(--tinta-2);
  margin-bottom: 1.5rem;
}

.intro strong {
  color: var(--tinta);
}

.pendencias {
  margin-bottom: 1.5rem;
}

.pendencias__lista {
  margin: 0.5rem 0 0;
  padding-left: 1.1rem;
}

.download {
  margin-bottom: 2.5rem;
}

.download__titulo {
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--filete);
}

.download__arquivo {
  font-family: var(--mono);
  font-size: 0.9375rem;
  color: var(--azul);
  margin-bottom: 0.5rem;
}

.download__texto {
  font-size: 0.875rem;
  color: var(--tinta-2);
  margin-bottom: 1.25rem;
}

.download__acoes {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.download__ok {
  margin: 0.9rem 0 0;
  font-size: 0.8125rem;
  color: var(--verde);
}

.secao__titulo {
  margin-bottom: 0.9rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--filete-forte);
}

.tabela-wrap {
  overflow-x: auto;
}

.revisao {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8125rem;
  min-width: 34rem;
}

.revisao thead th {
  text-align: left;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--tinta-3);
  padding: 0 0.75rem 0.4rem 0;
  border-bottom: 1px solid var(--filete-forte);
}

.revisao td {
  padding: 0.6rem 0.75rem 0.6rem 0;
  border-bottom: 1px solid var(--filete);
  vertical-align: top;
  color: var(--tinta-2);
}

.revisao__n {
  font-variant-numeric: tabular-nums;
  color: var(--tinta-3);
  width: 2rem;
}

.revisao__acao {
  white-space: nowrap;
  font-size: 0.75rem;
}

.valores {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.15rem;
}

.valores li {
  display: flex;
  gap: 0.5rem;
  align-items: baseline;
}

.valores__rotulo {
  font-family: var(--mono);
  color: var(--tinta-3);
  font-size: 0.75rem;
  min-width: 8rem;
}

.valores__valor {
  font-family: var(--mono);
  color: var(--tinta);
}

.valores__valor--vazio {
  color: #b09070;
  font-style: italic;
  font-family: var(--sans);
  font-size: 0.75rem;
}

.valores__obs {
  margin: 0.4rem 0 0;
  padding-left: 0.6rem;
  border-left: 2px solid var(--filete);
  font-size: 0.75rem;
  color: var(--tinta-3);
}

.fim {
  margin-top: 2.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--filete);
}
</style>
