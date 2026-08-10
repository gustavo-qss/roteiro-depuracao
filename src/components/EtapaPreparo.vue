<script setup>
import { computed, ref } from 'vue'
import BlocoCodigo from './BlocoCodigo.vue'

const props = defineProps({
  aluno: { type: Object, required: true },
  algoritmo: { type: Object, required: true },
  codigo: { type: String, required: true },
})

defineEmits(['avancar', 'voltar'])

const conferencia = ref({
  projeto: false,
  classe: false,
  breakpoints: false,
})

const tudoPronto = computed(() => Object.values(conferencia.value).every(Boolean))

const nomeArquivo = computed(() => `${props.algoritmo.classe}.java`)
</script>

<template>
  <section>
    <p class="eyebrow">Etapa 2</p>
    <h2 class="titulo">Prepare o IntelliJ</h2>
    <p class="intro">
      Olá, <strong>{{ aluno.nome }}</strong
      >. O algoritmo sorteado para a sua matrícula é o
      <strong>{{ algoritmo.classe }}</strong> — {{ algoritmo.titulo.toLowerCase() }}.
      {{ algoritmo.sinopse }}
    </p>

    <!-- 1. Instrucoes -->
    <div class="cartao secao">
      <h3 class="secao__titulo">Passo a passo no IntelliJ</h3>
      <ol class="roteiro">
        <li>
          Abra o IntelliJ IDEA e crie um projeto Java novo
          (<em>New Project</em> → <em>Language: Java</em> →
          <em>Build system: IntelliJ</em>). Se pedir JDK, use
          <em>Download JDK…</em> e escolha uma versão LTS (17 ou 21).
        </li>
        <li>
          Na pasta <code>src</code>, clique com o botão direito →
          <em>New</em> → <em>Java Class</em> e digite exatamente
          <code>{{ algoritmo.classe }}</code>.
          <span class="destaque"
            >O nome da classe precisa ser idêntico, senão o Java não compila.</span
          >
        </li>
        <li>
          Apague o conteúdo que o IntelliJ criou e cole o código abaixo no lugar (use o
          botão <em>Copiar</em>).
        </li>
        <li>
          Coloque os três breakpoints clicando na <strong>margem esquerda</strong> do
          editor, ao lado do número da linha. Aparece uma bolinha vermelha 🔴. As linhas
          estão marcadas com <code>// BP1</code>, <code>// BP2</code> e
          <code>// BP3</code> no próprio código.
        </li>
        <li>
          <strong>Ainda não rode nada.</strong> A próxima tela vai dizer a hora exata de
          apertar <kbd>Shift</kbd> + <kbd>F9</kbd> (Debug).
        </li>
      </ol>
    </div>

    <!-- 2. Codigo -->
    <div class="secao">
      <h3 class="secao__titulo secao__titulo--solto">Seu código</h3>
      <p class="secao__aviso">
        Os números deste programa foram gerados a partir da sua matrícula
        <code>{{ aluno.matricula }}</code>. Não troque esses valores — é por eles que a
        sua resposta será conferida.
      </p>
      <BlocoCodigo :codigo="codigo" :nome-arquivo="nomeArquivo" />
    </div>

    <!-- 3. Breakpoints -->
    <div class="cartao secao">
      <h3 class="secao__titulo">Onde ficam os breakpoints</h3>
      <table class="tabela">
        <thead>
          <tr>
            <th scope="col">Marca</th>
            <th scope="col">Método</th>
            <th scope="col">Linha</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="bp in algoritmo.breakpoints" :key="bp.rotulo">
            <td class="tabela__bp">
              <span class="ponto" aria-hidden="true"></span>{{ bp.rotulo }}
            </td>
            <td class="tabela__mono">{{ bp.onde }}</td>
            <td class="tabela__mono">{{ bp.linha }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 4. Conferencia -->
    <div class="cartao secao">
      <h3 class="secao__titulo">Antes de continuar</h3>
      <p class="secao__texto">Marque os três itens para liberar a próxima etapa.</p>

      <label class="conferencia">
        <input v-model="conferencia.projeto" type="checkbox" />
        <span>Criei um projeto Java no IntelliJ e ele abriu sem erro.</span>
      </label>
      <label class="conferencia">
        <input v-model="conferencia.classe" type="checkbox" />
        <span>
          Criei a classe <code>{{ algoritmo.classe }}</code> e colei o código exatamente
          como está acima.
        </span>
      </label>
      <label class="conferencia">
        <input v-model="conferencia.breakpoints" type="checkbox" />
        <span>
          Coloquei as três bolinhas vermelhas nas linhas
          <code>// BP1</code>, <code>// BP2</code> e <code>// BP3</code>.
        </span>
      </label>

      <div class="acoes">
        <button class="botao" type="button" :disabled="!tudoPronto" @click="$emit('avancar')">
          Estou pronto — começar a depuração
        </button>
        <button class="botao botao--secundario" type="button" @click="$emit('voltar')">
          Não sou este aluno
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
  max-width: 46rem;
  color: var(--tinta-2);
  margin-bottom: 1.75rem;
}

.secao {
  margin-bottom: 1.5rem;
}

.secao__titulo {
  margin-bottom: 0.9rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--filete);
}

.secao__titulo--solto {
  border-bottom: none;
  padding-bottom: 0;
  margin-bottom: 0.4rem;
}

.secao__texto {
  color: var(--tinta-2);
  font-size: 0.9375rem;
  margin-bottom: 1rem;
}

.secao__aviso {
  font-size: 0.8125rem;
  color: var(--tinta-2);
  margin-bottom: 0.75rem;
  max-width: 46rem;
}

.roteiro {
  margin: 0;
  padding-left: 1.3rem;
  color: var(--tinta-2);
  font-size: 0.9375rem;
}

.roteiro li {
  margin-bottom: 0.75rem;
  padding-left: 0.25rem;
}

.roteiro li:last-child {
  margin-bottom: 0;
}

.roteiro strong,
.intro strong {
  color: var(--tinta);
}

.roteiro em {
  font-style: normal;
  font-family: var(--mono);
  font-size: 0.8125rem;
  color: var(--azul);
}

.destaque {
  display: block;
  margin-top: 0.3rem;
  font-size: 0.8125rem;
  color: var(--terra);
}

code {
  font-size: 0.8125rem;
  padding: 0.05rem 0.3rem;
  background: var(--superficie-2);
  border: 1px solid var(--filete);
  border-radius: 2px;
}

/* tabela de breakpoints */
.tabela {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8125rem;
  display: block;
  overflow-x: auto;
}

.tabela thead th {
  text-align: left;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--tinta-3);
  padding: 0 0.75rem 0.4rem 0;
  border-bottom: 1px solid var(--filete-forte);
  white-space: nowrap;
}

.tabela td {
  padding: 0.55rem 0.75rem 0.55rem 0;
  border-bottom: 1px solid var(--filete);
  vertical-align: top;
  white-space: nowrap;
}

.tabela tbody tr:last-child td {
  border-bottom: none;
}

.tabela__bp {
  font-weight: 600;
  white-space: nowrap;
}

.tabela__mono {
  font-family: var(--mono);
  color: var(--tinta-2);
}

.ponto {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #c8342a;
  margin-right: 0.45rem;
}

/* conferencia */
.conferencia {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.6rem 0;
  border-bottom: 1px solid var(--filete);
  font-size: 0.9375rem;
  color: var(--tinta-2);
  cursor: pointer;
}

.conferencia:last-of-type {
  border-bottom: none;
}

.conferencia input {
  margin-top: 0.3rem;
  width: 1rem;
  height: 1rem;
  accent-color: var(--azul);
  flex: none;
}

.acoes {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-top: 1.25rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--filete);
}
</style>
