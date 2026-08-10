<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import BlocoCodigo from './BlocoCodigo.vue'

const props = defineProps({
  algoritmo: { type: Object, required: true },
  codigo: { type: String, required: true },
  passos: { type: Array, required: true },
  respostas: { type: Array, required: true },
})

const emit = defineEmits(['concluir', 'voltar'])

const indice = ref(0)
const aviso = ref('')

const passo = computed(() => props.passos[indice.value])
const resposta = computed(() => props.respostas[indice.value])
const total = computed(() => props.passos.length)
const ultimo = computed(() => indice.value === total.value - 1)

const preenchidos = computed(() =>
  props.respostas.filter((r, i) =>
    props.passos[i].campos.every((c) => {
      const v = r.campos[c.id]
      return v !== undefined && String(v).trim() !== ''
    }),
  ).length,
)

const faltando = computed(() =>
  passo.value.campos.filter((c) => {
    const v = resposta.value.campos[c.id]
    return v === undefined || String(v).trim() === ''
  }),
)

watch(indice, () => {
  aviso.value = ''
  nextTick(() => {
    document.getElementById('inicio-passo')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
})

function avancar() {
  if (faltando.value.length > 0 && !aviso.value) {
    aviso.value = `Ficaram ${faltando.value.length} campo(s) em branco. Aperte de novo para avançar assim mesmo.`
    return
  }
  if (ultimo.value) {
    emit('concluir')
    return
  }
  indice.value++
}

function voltar() {
  if (indice.value === 0) {
    emit('voltar')
    return
  }
  indice.value--
}

function irPara(i) {
  indice.value = i
}
</script>

<template>
  <section>
    <div id="inicio-passo"></div>

    <div class="cabecalho">
      <div>
        <p class="eyebrow">Etapa 3 · {{ algoritmo.classe }}.java</p>
        <h2 class="titulo">
          Passo {{ passo.n }} <span class="titulo__de">de {{ total }}</span>
        </h2>
      </div>
      <p class="contador">{{ preenchidos }}/{{ total }} preenchidos</p>
    </div>

    <div
      class="barra"
      role="progressbar"
      :aria-valuenow="passo.n"
      aria-valuemin="1"
      :aria-valuemax="total"
    >
      <span class="barra__preenchida" :style="{ width: `${(passo.n / total) * 100}%` }"></span>
    </div>

    <!-- Instrucao de largada, so no primeiro passo -->
    <div v-if="indice === 0" class="nota nota--atencao partida">
      <strong>Comece agora:</strong> aperte <kbd>Shift</kbd> + <kbd>F9</kbd> (Debug) no
      IntelliJ. O programa roda e para sozinho na linha do <strong>BP1</strong>, que é
      exatamente onde este passo começa.
    </div>

    <!-- Onde o depurador esta -->
    <div class="cartao painel">
      <p class="painel__local">{{ passo.local }}</p>
      <p v-if="passo.linha" class="painel__linha">{{ passo.linha }}</p>
      <p class="painel__contexto">{{ passo.contexto }}</p>
    </div>

    <!-- Campos -->
    <div class="cartao painel">
      <h3 class="painel__titulo">Anote o que você está vendo</h3>

      <div class="campos">
        <div
          v-for="campo in passo.campos"
          :key="campo.id"
          class="campo-linha"
          :class="{ 'campo-linha--larga': campo.tipo === 'texto' || campo.tipo === 'escolha' }"
        >
          <label class="campo-rotulo" :for="`c-${indice}-${campo.id}`">
            {{ campo.rotulo }}
          </label>

          <!-- numero -->
          <input
            v-if="campo.tipo === 'int'"
            :id="`c-${indice}-${campo.id}`"
            v-model="resposta.campos[campo.id]"
            class="campo campo--mono"
            type="text"
            inputmode="numeric"
            autocomplete="off"
            placeholder="—"
          />

          <!-- array -->
          <input
            v-else-if="campo.tipo === 'array'"
            :id="`c-${indice}-${campo.id}`"
            v-model="resposta.campos[campo.id]"
            class="campo campo--mono"
            type="text"
            autocomplete="off"
            placeholder="ex.: 12, 7, 30, 5"
          />

          <!-- escolha -->
          <div v-else-if="campo.tipo === 'escolha'" class="opcoes">
            <label
              v-for="opcao in campo.opcoes"
              :key="opcao"
              class="opcao"
              :class="{ 'opcao--ativa': resposta.campos[campo.id] === opcao }"
            >
              <input
                v-model="resposta.campos[campo.id]"
                type="radio"
                :name="`c-${indice}-${campo.id}`"
                :value="opcao"
              />
              <span>{{ opcao }}</span>
            </label>
          </div>

          <!-- texto livre -->
          <textarea
            v-else
            :id="`c-${indice}-${campo.id}`"
            v-model="resposta.campos[campo.id]"
            class="campo"
            rows="3"
          ></textarea>

          <p v-if="campo.ajuda" class="campo-ajuda">{{ campo.ajuda }}</p>
        </div>
      </div>

      <div class="observacao">
        <label class="campo-rotulo" :for="`obs-${indice}`">
          Observação — o que aconteceu, em suas palavras <span class="opcional">(opcional)</span>
        </label>
        <textarea
          :id="`obs-${indice}`"
          v-model="resposta.observacao"
          class="campo"
          rows="2"
          placeholder="Ex.: o valor de parcial só apareceu depois que executei a linha."
        ></textarea>
      </div>
    </div>

    <!-- Acao a executar -->
    <div v-if="passo.acao" class="cartao acao">
      <p class="acao__intro">Depois de anotar, execute no IntelliJ:</p>
      <p class="acao__comando">
        <span class="acao__nome">{{ passo.acao.nome }}</span>
        <kbd>{{ passo.acao.tecla }}</kbd>
      </p>
      <p class="acao__resumo">{{ passo.acao.resumo }}</p>
    </div>
    <div v-else class="cartao acao acao--fim">
      <p class="acao__intro">Fim do roteiro</p>
      <p class="acao__resumo">
        Não há mais nada para executar. Confira a aba <em>Console</em> e siga para a
        entrega.
      </p>
    </div>

    <p v-if="aviso" class="aviso" role="alert">{{ aviso }}</p>

    <div class="navegacao">
      <button class="botao botao--secundario" type="button" @click="voltar">
        {{ indice === 0 ? 'Voltar ao código' : 'Passo anterior' }}
      </button>
      <button class="botao" type="button" @click="avancar">
        {{ ultimo ? 'Concluir e gerar arquivo' : 'Próximo passo' }}
      </button>
    </div>

    <!-- Consulta -->
    <details class="consulta">
      <summary>Consultar o código sem sair daqui</summary>
      <div class="consulta__corpo">
        <BlocoCodigo :codigo="codigo" :nome-arquivo="`${algoritmo.classe}.java`" />
      </div>
    </details>

    <details class="consulta">
      <summary>Ir direto para outro passo</summary>
      <div class="consulta__corpo">
        <ol class="mapa">
          <li v-for="(p, i) in passos" :key="i">
            <button
              type="button"
              class="mapa__item"
              :class="{
                'mapa__item--atual': i === indice,
                'mapa__item--ok': passos[i].campos.every(
                  (c) =>
                    respostas[i].campos[c.id] !== undefined &&
                    String(respostas[i].campos[c.id]).trim() !== '',
                ),
              }"
              @click="irPara(i)"
            >
              <span class="mapa__n">{{ i + 1 }}</span>
              <span class="mapa__local">{{ p.local }}</span>
            </button>
          </li>
        </ol>
      </div>
    </details>
  </section>
</template>

<style scoped>
.cabecalho {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.6rem;
}

.titulo {
  margin: 0;
}

.titulo__de {
  font-size: 1rem;
  font-weight: 400;
  color: var(--tinta-3);
}

.contador {
  margin: 0;
  font-size: 0.75rem;
  color: var(--tinta-3);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.barra {
  height: 3px;
  background: var(--filete);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 1.5rem;
}

.barra__preenchida {
  display: block;
  height: 100%;
  background: var(--azul);
  transition: width 0.25s ease;
}

.partida {
  margin-bottom: 1.25rem;
}

.painel {
  margin-bottom: 1.25rem;
}

.painel__local {
  margin: 0 0 0.5rem;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.11em;
  text-transform: uppercase;
  color: var(--azul);
}

.painel__linha {
  margin: 0 0 0.7rem;
  padding: 0.55rem 0.75rem;
  font-family: var(--mono);
  font-size: 0.875rem;
  background: var(--superficie-2);
  border-left: 2px solid var(--azul);
  border-radius: 0 2px 2px 0;
  overflow-x: auto;
  white-space: pre;
}

.painel__contexto {
  margin: 0;
  font-size: 0.9375rem;
  color: var(--tinta-2);
}

.painel__titulo {
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--filete);
}

/* campos */
.campos {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
  gap: 1rem;
}

.campo-linha--larga {
  grid-column: 1 / -1;
}

.campo-rotulo {
  display: block;
  font-family: var(--mono);
  font-size: 0.8125rem;
  color: var(--tinta);
  margin-bottom: 0.35rem;
}

.campo-ajuda {
  margin: 0.3rem 0 0;
  font-size: 0.75rem;
  color: var(--tinta-3);
}

.opcoes {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.opcao {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.85rem;
  border: 1px solid var(--filete-forte);
  border-radius: 2px;
  background: var(--superficie);
  font-size: 0.875rem;
  color: var(--tinta-2);
  cursor: pointer;
}

.opcao:hover {
  border-color: var(--azul-filete);
  background: var(--superficie-2);
}

.opcao--ativa {
  border-color: var(--azul);
  background: var(--azul-claro);
  color: var(--azul);
  font-weight: 500;
}

.opcao input {
  accent-color: var(--azul);
  margin: 0;
}

.observacao {
  margin-top: 1.25rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--filete);
}

.observacao .campo-rotulo {
  font-family: var(--sans);
  color: var(--tinta-2);
}

.opcional {
  color: var(--tinta-3);
}

/* acao */
.acao {
  border-left: 3px solid var(--azul);
  margin-bottom: 1.25rem;
}

.acao--fim {
  border-left-color: var(--verde);
}

.acao__intro {
  margin: 0 0 0.45rem;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.11em;
  text-transform: uppercase;
  color: var(--tinta-3);
}

.acao__comando {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0 0 0.35rem;
}

.acao__nome {
  font-family: var(--serifada);
  font-size: 1.3rem;
  color: var(--tinta);
}

.acao__resumo {
  margin: 0;
  font-size: 0.875rem;
  color: var(--tinta-2);
}

.aviso {
  margin: 0 0 1rem;
  padding: 0.6rem 0.75rem;
  border-left: 2px solid #d8b48a;
  background: var(--terra-claro);
  font-size: 0.8125rem;
  color: #7a4318;
}

.navegacao {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.6rem;
  margin-bottom: 2rem;
}

/* consultas */
.consulta {
  border-top: 1px solid var(--filete);
  padding: 0.75rem 0;
}

.consulta summary {
  cursor: pointer;
  font-size: 0.8125rem;
  color: var(--tinta-2);
  list-style: none;
}

.consulta summary::-webkit-details-marker {
  display: none;
}

.consulta summary::before {
  content: '+ ';
  color: var(--tinta-3);
}

.consulta[open] summary::before {
  content: '– ';
}

.consulta summary:hover {
  color: var(--azul);
}

.consulta__corpo {
  padding-top: 0.9rem;
}

.mapa {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 1px;
}

.mapa__item {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  width: 100%;
  text-align: left;
  font: inherit;
  font-size: 0.8125rem;
  padding: 0.4rem 0.5rem;
  border: none;
  border-bottom: 1px solid var(--filete);
  background: transparent;
  color: var(--tinta-2);
  cursor: pointer;
}

.mapa__item:hover {
  background: var(--superficie-2);
}

.mapa__item--atual {
  background: var(--azul-claro);
  color: var(--azul);
  font-weight: 600;
}

.mapa__n {
  flex: none;
  width: 1.5rem;
  text-align: right;
  font-variant-numeric: tabular-nums;
  color: var(--tinta-3);
}

.mapa__item--ok .mapa__n::after {
  content: ' ✓';
  color: var(--verde);
}

@media (max-width: 640px) {
  .navegacao .botao {
    flex: 1 1 100%;
  }
}
</style>
