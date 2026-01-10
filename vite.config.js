import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  // base: '/EduVoice/', // REMOVED for Vercel deployment
  server: {
    port: 3000,
    open: true
  }
})

