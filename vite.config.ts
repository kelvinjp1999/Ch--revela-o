import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // O site é publicado em https://kelvinjp1999.github.io/Ch--revela-o/.
  // Sem este prefixo, o GitHub Pages procura os assets em /assets e retorna 404.
  base: '/Ch--revela-o/',
  plugins: [react()],
})
