import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Em GitHub Pages de projeto o site fica em https://<usuario>.github.io/<repositorio>/,
// entao o base precisa ser "/<repositorio>/". Defina BASE_URL no workflow ou troque o
// valor padrao abaixo pelo nome do seu repositorio.
const base = process.env.BASE_URL ?? '/roteiro-depuracao/'

export default defineConfig({
  base,
  plugins: [vue()],
  build: {
    outDir: 'dist',
    // O gabarito NUNCA pode ser empacotado no site: ele vive so em validador/.
    rollupOptions: {
      external: [],
    },
  },
})
