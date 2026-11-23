import type { APIRoute } from 'astro';
import { site } from '@/config/site';

/**
 * sitemap.xml gerado no build (https://www.droplabweb.com/sitemap.xml).
 * As páginas vêm dos arquivos .astro de src/pages: uma página nova entra sozinha.
 * Ficam de fora a 404 e as rotas que não são páginas (robots.txt, manifest, este sitemap).
 * lastmod = data do build. Sem site.url (domínio vazio), o arquivo não é gerado.
 */
const pages = Object.keys(import.meta.glob('./**/*.astro'))
  .map((file) => file.replace(/^\.\//, '').replace(/\.astro$/, ''))
  .filter((route) => route !== '404' && !route.includes('['))
  .map((route) => (route === 'index' ? '/' : `/${route.replace(/\/index$/, '')}`))
  .sort((a, b) => (a === '/' ? -1 : b === '/' ? 1 : a.localeCompare(b)));

export const GET: APIRoute = () => {
  if (!site.url) return new Response(null, { status: 404 });

  const lastmod = new Date().toISOString().slice(0, 10);
  const urls = pages
    .map(
      (path) =>
        `  <url>\n    <loc>${new URL(path, site.url).href}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`,
    )
    .join('\n');

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
};
