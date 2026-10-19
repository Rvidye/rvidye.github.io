import type { APIRoute } from 'astro';

// Generated so the sitemap URL follows `site` in astro.config.mjs (e.g. after the move to rvidye.dev).
export const GET: APIRoute = ({ site }) => {
  const sitemap = new URL('sitemap-index.xml', site);
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${sitemap.href}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
