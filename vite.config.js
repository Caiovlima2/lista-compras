import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Nome do repositório no GitHub Pages
  base: '/lista-compras/',
  plugins: [tailwindcss()],
});
