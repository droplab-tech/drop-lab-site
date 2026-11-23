import type { APIRoute } from 'astro';
import { site } from '@/config/site';

/** robots.txt gerado no build. A linha Sitemap só aparece quando site.url estiver preenchida. */
export const GET: APIRoute = () =>
  new Response(
    [
      'User-agent: *',
      'Allow: /',
      ...(site.url ? [`Sitemap: ${site.url}/sitemap.xml`] : []),
      '',
    ].join('\n'),
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
