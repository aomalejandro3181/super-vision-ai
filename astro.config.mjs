// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import AstroPWA from '@vite-pwa/astro';

import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  vite: {
    plugins: [
      tailwindcss(),
      AstroPWA({
        registerType: 'autoUpdate',
        manifest: {
          name: 'SuperVision.ai',
          short_name: 'SuperVision',
          description: 'Auditoría de góndolas con IA',
          theme_color: '#4f46e5',
          background_color: '#0f172a',
          display: 'standalone',
          icons: [
            {
              src: '/icons/icon-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: '/icons/icon-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        },
        workbox: {
          navigateFallback: '/',
          globPatterns: ['**/*.{js,css,html,svg,png,jpg,jpeg}']
        }
      })
    ]
  },

  integrations: [react()],
  adapter: vercel()
});