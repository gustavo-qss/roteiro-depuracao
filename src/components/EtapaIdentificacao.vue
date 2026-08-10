<script setup>
import { ref } from 'vue'
import { normalizarMatricula } from '../core/derivacao.js'

const props = defineProps({
  alunos: { type: Map, required: true },
})

const emit = defineEmits(['confirmar'])

const entrada = ref('')
const erro = ref('')
const encontrado = ref(null)

function aoDigitar(e) {
  entrada.value = normalizarMatricula(e.target.value).slice(0, 9)
  erro.value = ''
}

function buscar() {
  const matricula = normalizarMatricula(entrada.value)

  if (matricula.length !== 9) {
    erro.value = 'A matrícula tem 9 dígitos. Confira o número digitado.'
    return
  }

  const nome = props.alunos.get(matricula)
  if (!nome) {
    erro.value =
      'Matrícula não encontrada na lista desta turma. Confira o número ou avise o professor.'
    return
  }

  erro.value = ''
  encontrado.value = { matricula, nome }
}

function voltarBusca() {
  encontrado.value = null
  entrada.value = ''
}
</script>

<template>
  <section v-if="!encontrado">
    <p class="eyebrow">Etapa 1</p>
    <h2 class="titulo">Identifique-se</h2>
    <p class="intro">
      Informe sua matrícula para receber o algoritmo desta atividade. Cada aluno recebe
      um programa com valores próprios, então os resultados que você vai anotar são
      diferentes dos do colega ao lado.
    </p>

    <form class="cartao forma" @submit.prevent="buscar">
      <label class="rotulo" for="matricula">Matrícula</label>
      <input
        id="matricula"
        class="campo campo--mono entrada"
        :value="entrada"
        type="text"
        inputmode="numeric"
        autocomplete="off"
        placeholder="000000000"
        maxlength="9"
        aria-describedby="ajuda-matricula"
        @input="aoDigitar"
      />
      <p id="ajuda-matricula" class="ajuda">9 dígitos, sem pontos ou traços.</p>

      <p v-if="erro" class="erro" role="alert">{{ erro }}</p>

      <button class="botao" type="submit" :disabled="entrada.length !== 9">
        Buscar meu nome
      </button>
    </form>
  </section>

  <section v-else>
    <p class="eyebrow">Etapa 1 · Confirmação</p>
    <h2 class="titulo">É você mesmo?</h2>
    <p class="intro">
      Confira o nome abaixo antes de continuar. Se estiver errado, volte e digite a
      matrícula de novo — a atividade fica registrada no nome que você confirmar aqui.
    </p>

    <div class="cartao ficha">
      <dl class="ficha__dados">
        <div>
          <dt>Nome</dt>
          <dd class="ficha__nome">{{ encontrado.nome }}</dd>
        </div>
        <div>
          <dt>Matrícula</dt>
          <dd class="ficha__matricula">{{ encontrado.matricula }}</dd>
        </div>
      </dl>

      <div class="ficha__acoes">
        <button class="botao" type="button" @click="emit('confirmar', encontrado)">
          Sim, sou eu — continuar
        </button>
        <button class="botao botao--secundario" type="button" @click="voltarBusca">
          Não sou eu
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.titulo {
  margin-bottom: 0.6rem;
}

.intro {
  max-width: 42rem;
  color: var(--tinta-2);
  margin-bottom: 1.5rem;
}

.forma {
  max-width: 24rem;
}

.rotulo {
  display: block;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--tinta-3);
  margin-bottom: 0.4rem;
}

.entrada {
  font-size: 1.25rem;
  letter-spacing: 0.16em;
  text-align: center;
}

.ajuda {
  margin: 0.45rem 0 0;
  font-size: 0.75rem;
  color: var(--tinta-3);
}

.erro {
  margin: 0.9rem 0 0;
  padding: 0.6rem 0.75rem;
  border-left: 2px solid #c8342a;
  background: #fdf1ef;
  font-size: 0.8125rem;
  color: #7d2a22;
}

.forma .botao {
  margin-top: 1.1rem;
  width: 100%;
}

.ficha {
  max-width: 34rem;
}

.ficha__dados {
  margin: 0 0 1.5rem;
  display: grid;
  gap: 1rem;
}

.ficha__dados dt {
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--tinta-3);
  margin-bottom: 0.2rem;
}

.ficha__dados dd {
  margin: 0;
}

.ficha__nome {
  font-family: var(--serifada);
  font-size: 1.3rem;
  line-height: 1.3;
}

.ficha__matricula {
  font-family: var(--mono);
  font-size: 1rem;
  letter-spacing: 0.06em;
}

.ficha__acoes {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--filete);
}
</style>
