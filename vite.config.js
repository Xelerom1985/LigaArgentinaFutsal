import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

// Tamaño aproximado de la app completa (lo que baja el service worker la primera vez),
// para estimar el consumo del hosting en el Backoffice: carpeta public + ~400 KB de JS/CSS (precache real 25/11: ~2,6 MB)
const tamDir = d => readdirSync(d).reduce((t, f) => { const r = join(d, f); const s = statSync(r); return t + (s.isDirectory() ? tamDir(r) : s.size) }, 0)
const APP_KB = Math.round(tamDir('public') / 1024) + 400

export default defineConfig({
  // Rutas relativas: funciona en Firebase Hosting, GitHub Pages o cualquier subcarpeta
  base: './',
  define: { __APP_KB__: APP_KB },
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.png', 'logo.png', 'icons/apple-touch-icon.png'],
      workbox: { clientsClaim: true, globPatterns: ['**/*.{js,css,html,png,svg,webp,woff2}'] },
      manifest: {
        name: 'Liga Argentina',
        short_name: 'Liga Argentina',
        description: 'Zonas, clubes y ubicaciones de la Liga Argentina de Futsal',
        lang: 'es-AR',
        theme_color: '#0b1f3a',
        background_color: '#0b1f3a',
        display: 'standalone',
        orientation: 'portrait',
        start_url: './',
        scope: './',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      }
    })
  ]
})
