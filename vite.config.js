import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/eduvoice/', // Repository name for GitHub Pages
  server: {
    port: 3000,
    open: true
  }
})
