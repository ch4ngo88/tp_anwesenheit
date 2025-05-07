import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ⚠️ Pfad muss zu deinem Repo-Namen passen
export default defineConfig({
  plugins: [react()],
  base: '/tp_anwesenheit/',
})
