import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  // Nome do repositório no GitHub Pages
  base: '/lista-compras/',
  plugins: [
    tailwindcss(),
    VitePWA({
      // Atualiza sozinho quando você publica uma versão nova
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Lista de Compras',
        short_name: 'Compras',
        description: 'Planeje a lista, anote os preços no mercado e acompanhe seus gastos.',
        lang: 'pt-BR',
        theme_color: '#15803d',
        background_color: '#f9f9ff',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: 'icons/icone-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icone-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icone-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Fontes do Google ficam guardadas para o app abrir igual sem internet
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'fontes',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
});
