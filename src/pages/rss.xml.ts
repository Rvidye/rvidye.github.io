import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { SITE } from '../lib/site';
import { getPosts, postUrl } from '../lib/content';

// Published articles only, newest first. Drafts are excluded even in dev, so
// the feed never differs between `npm run dev` and production.
export const GET: APIRoute = async (context) => {
  if (!context.site) throw new Error('rss.xml needs `site` in astro.config.mjs.');
  const posts = (await getPosts()).filter((post) => !post.data.draft && post.data.date);
  return rss({
    title: `${SITE.title}: blog`,
    description: SITE.description,
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: postUrl(post),
      categories: post.data.tags,
    })),
    customData: `<language>${SITE.lang}</language>`,
  });
};
