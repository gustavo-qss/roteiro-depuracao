<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  codigo: { type: String, required: true },
  nomeArquivo: { type: String, default: 'Codigo.java' },
})

/* Tokenizador minimo de Java — o suficiente para dar hierarquia visual
   sem transformar o bloco num arco-iris. */
const REGEX_TOKENS =
  /(\/\/[^\n]*)|("(?:\\.|[^"\\])*")|\b(\d+)\b|\b(public|static|void|int|boolean|class|for|if|else|return|new|true|false|length)\b/g

function escapar(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function realcar(linha) {
  let saida = ''
  let ultimo = 0
  REGEX_TOKENS.lastIndex = 0
  let m
  while ((m = REGEX_TOKENS.exec(linha)) !== null) {
    saida += escapar(linha.slice(ultimo, m.index))
    const classe = m[1]
      ? 'tk-comentario'
      : m[2]
        ? 'tk-texto'
        : m[3]
          ? 'tk-numero'
          : 'tk-chave'
    saida += `<span class="${classe}">${escapar(m[0])}</span>`
    ultimo = m.index + m[0].length
  }
  saida += escapar(linha.slice(ultimo))
  return saida
}

const linhas = computed(() =>
  props.codigo.replace(/\n$/, '').split('\n').map((texto, i) => {
    const bp = texto.match(/\/\/\s*(BP\d)/)
    return { n: i + 1, html: realcar(texto), breakpoint: bp ? bp[1] : null }
  }),
)

const copiado = ref(false)

async function copiar() {
  try {
    await navigator.clipboard.writeText(props.codigo)
  } catch {
    // Fallback para navegadores sem permissao de clipboard.
    const area = document.createElement('textarea')
    area.value = props.codigo
    area.style.position = 'fixed'
    area.style.opacity = '0'
    document.body.appendChild(area)
    area.select()
    document.execCommand('copy')
    document.body.removeChild(area)
  }
  copiado.value = true
  setTimeout(() => (copiado.value = false), 2200)
}

function baixar() {
  const blob = new Blob([props.codigo], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = props.nomeArquivo
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <figure class="bloco">
    <figcaption class="bloco__topo">
      <span class="bloco__arquivo">{{ nomeArquivo }}</span>
      <span class="bloco__acoes">
        <button type="button" class="bloco__botao" @click="copiar">
          {{ copiado ? 'Copiado ✓' : 'Copiar' }}
        </button>
        <button type="button" class="bloco__botao" @click="baixar">Baixar .java</button>
      </span>
    </figcaption>

    <pre class="bloco__codigo"><code><span
        v-for="l in linhas"
        :key="l.n"
        class="linha"
        :class="{ 'linha--bp': l.breakpoint }"
      ><span class="linha__gutter" :title="l.breakpoint ? `Breakpoint ${l.breakpoint}` : null"><span
            v-if="l.breakpoint"
            class="linha__bp"
            aria-hidden="true"
          ></span></span><span class="linha__n">{{ l.n }}</span><span
        class="linha__texto"
        v-html="l.html || '&nbsp;'"
      ></span></span></code></pre>
  </figure>
</template>

<style scoped>
.bloco {
  margin: 0;
  border: 1px solid var(--filete);
  border-radius: 2px;
  background: var(--superficie-2);
  overflow: hidden;
}

.bloco__topo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid var(--filete);
  background: var(--superficie);
}

.bloco__arquivo {
  font-family: var(--mono);
  font-size: 0.8125rem;
  color: var(--tinta-2);
}

.bloco__acoes {
  display: flex;
  gap: 0.4rem;
}

.bloco__botao {
  font: inherit;
  font-size: 0.75rem;
  padding: 0.25rem 0.6rem;
  border: 1px solid var(--filete-forte);
  border-radius: 2px;
  background: var(--superficie);
  color: var(--tinta-2);
  cursor: pointer;
}

.bloco__botao:hover {
  background: var(--azul-claro);
  border-color: var(--azul-filete);
  color: var(--azul);
}

.bloco__codigo {
  margin: 0;
  padding: 0.6rem 0;
  overflow-x: auto;
  font-size: 0.8125rem;
  line-height: 1.65;
  tab-size: 4;
}

.linha {
  display: flex;
  align-items: baseline;
  min-width: max-content;
}

.linha--bp {
  background: #fdf1ef;
}

.linha__gutter {
  flex: none;
  width: 1.1rem;
  display: flex;
  justify-content: center;
  align-self: center;
}

.linha__bp {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #c8342a;
}

.linha__n {
  flex: none;
  width: 2.1rem;
  padding-right: 0.7rem;
  text-align: right;
  color: #b3aea2;
  user-select: none;
}

.linha__texto {
  white-space: pre;
  padding-right: 1rem;
}

:deep(.tk-chave) {
  color: var(--azul);
  font-weight: 600;
}
:deep(.tk-numero) {
  color: var(--terra);
}
:deep(.tk-texto) {
  color: var(--verde);
}
:deep(.tk-comentario) {
  color: #948f80;
  font-style: italic;
}
</style>
