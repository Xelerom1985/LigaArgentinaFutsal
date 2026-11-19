import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  // Rutas relativas: funciona en Firebase Hosting, GitHub Pages o cualquier subcarpeta
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.png', 'logo.png', 'icons/apple-touch-icon.png'],
      workbox: { clientsClaim: true, globPatterns: ['**/*.{js,css,html,png,svg,woff2}'] },
      manifest: {
        name: 'Liga Argentina de Futsal',
        short_name: 'Liga Futsal',
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
          { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      }
    })
  ]
})
