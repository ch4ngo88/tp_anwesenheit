import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '', // ✅ erzwingt relative Pfade für Assets, JS, CSS
})
