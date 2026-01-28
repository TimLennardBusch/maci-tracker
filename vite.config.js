import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/habit-tracker/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['app-icon.jpg'],
      manifest: {
        name: '1%',
        short_name: '1%',
        description: 'Was macht mich heute 1% besser?',
        theme_color: '#6366f1',
        background_color: '#f8fafc',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/habit-tracker/',
        scope: '/habit-tracker/',
        icons: [
          {
            src: 'app-icon.jpg',
            sizes: '192x192',
            type: 'image/jpeg'
          },
          {
            src: 'app-icon.jpg',
            sizes: '512x512',
            type: 'image/jpeg'
          },
          {
            src: 'app-icon.jpg',
            sizes: '512x512',
            type: 'image/jpeg',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ]
})
