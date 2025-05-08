import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import legacy from '@vitejs/plugin-legacy'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),

    // ➜ ES5-Fallback + Polyfills
    legacy({
      /*   Targets siehe: https://browsersl.ist   */
      targets: ['defaults', 'not IE 11'],
      polyfills: true,
      modernPolyfills: true,
    }),

    // ➜ PWA
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt'],
      manifest: {
        name: 'Anwesenheitsliste',
        short_name: 'Anwesenheit',
        description: 'Digitale Anwesenheitsliste mit Auswertung',
        theme_color: '#22c55e',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],

  /*  relative Pfade für GitHub Pages */
  base: '',

  /*  kein build.target mehr -> Warning weg */
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1500,
  },
})
