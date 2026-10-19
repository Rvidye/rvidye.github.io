// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // The one place the public URL is defined. Pages read it through `Astro.site`
  // (canonical links now; sitemap and RSS later). When rvidye.dev is live, change
  // this to 'https://rvidye.dev'. A <username>.github.io repo serves from the
  // domain root, so no `base` is needed now or after the switch.
  site: 'https://rvidye.github.io',

  output: 'static',

  // GitHub Pages serves `about/index.html` at `/about/` and redirects `/about`
  // there. Requiring the slash in dev catches inconsistent internal links early.
  trailingSlash: 'always',

  // The sitemap lists every built page; drafts and /dev/ pages are never built in production.
  integrations: [mdx(), sitemap()],

  // Libertinus headings and code are downloaded at build time and served
  // locally. Body text uses the visitor's system sans font.
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'Libertinus Serif',
      cssVariable: '--font-serif',
      weights: [400, 600],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['serif'],
    },
    {
      provider: fontProviders.fontsource(),
      name: 'Libertinus Serif',
      cssVariable: '--font-serif',
      weights: [400],
      styles: ['italic'],
      subsets: ['latin'],
      fallbacks: ['serif'],
    },
    {
      provider: fontProviders.fontsource(),
      name: 'Libertinus Mono',
      cssVariable: '--font-mono',
      weights: [400],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['monospace'],
    },
  ],

  markdown: {
    // Code colours come from CSS custom properties in src/styles/prose.css.
    shikiConfig: { theme: 'css-variables' },
  },
});
