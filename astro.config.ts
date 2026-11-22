// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { site } from './src/config/site';

// https://astro.build/config
export default defineConfig({
  // URL final do domínio (edite em src/config/site.ts). Vazia = sem domínio ainda.
  site: site.url || undefined,
  output: 'static',
  trailingSlash: 'never',
  build: { format: 'file' },
  prefetch: false,
  // O padrão do Astro 7 ('jsx') remove os espaços nas quebras de linha entre texto e tags
  // (ex.: "dúvida?<a>"). `true` minifica preservando um espaço, como no HTML normal.
  compressHTML: true,
  // O sitemap exige um domínio absoluto: só é gerado quando site.url estiver preenchida
  integrations: site.url
    ? [
        sitemap({
          // A 404 não deve aparecer no sitemap
          filter: (page) => !page.includes('/404'),
        }),
      ]
    : [],
  vite: {
    plugins: [tailwindcss()],
  },
});
