import type { APIRoute } from 'astro';
import { site } from '@/config/site';

/** Web App Manifest (ícones para Android / "Adicionar à tela inicial"). */
export const GET: APIRoute = () =>
  new Response(
    JSON.stringify(
      {
        name: `${site.name} | ${site.slogan}`,
        short_name: site.name,
        description: site.description,
        lang: 'pt-BR',
        start_url: '/',
        display: 'standalone',
        background_color: '#05070D',
        theme_color: '#05070D',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
          { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' },
        ],
      },
      null,
      2,
    ),
    { headers: { 'Content-Type': 'application/manifest+json' } },
  );
