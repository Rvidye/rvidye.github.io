import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/*
 * Four collections, each validated at build time. Only facts the owner has
 * confirmed belong here: leave an optional field out rather than guess it.
 *
 * `draft: true` entries are listed and routed by the dev server only. They are
 * never in a production build (see isVisible in src/lib/content.ts).
 */

/** Awards and accepted posters or talks, worded exactly as confirmed. */
const recognition = z
  .array(
    z.object({
      label: z.string(),
      url: z.url().optional(),
      year: z.number().int().optional(),
      /** A few words for the ribbon on the project's picture, e.g. "TRC 2025 award". */
      badge: z.string().optional(),
    }),
  )
  .default([]);

/**
 * One entry per real piece of work. Research and personal projects share the
 * Projects index; kind distinguishes their detail-page metadata.
 */
const work = defineCollection({
  loader: glob({ base: './src/content/work', pattern: '**/*.{md,mdx}' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      /** One or two plain sentences; also the page's meta description. */
      description: z.string(),
      kind: z.enum(['research', 'project', 'experiment']),
      status: z.enum(['ongoing', 'completed', 'archived']),
      /** The owner's role, when it adds information (e.g. "Project lead"). */
      role: z.string().optional(),
      /** Optional featured selection; independent of the curated homepage threads. */
      featured: z.boolean().default(false),
      /** Position on the Projects page, lowest first. */
      order: z.number().int().default(100),
      draft: z.boolean().default(false),
      startDate: z.coerce.date().optional(),
      endDate: z.coerce.date().optional(),
      tags: z.array(z.string()).default([]),
      technologies: z.array(z.string()).default([]),
      /** The owner's own outputs. Only public URLs. */
      links: z
        .object({
          paper: z.url(),
          poster: z.url(),
          code: z.url(),
          video: z.url(),
          slides: z.url(),
          demo: z.url(),
          website: z.url(),
        })
        .partial()
        .default({}),
      /** Context that is not the owner's own output, e.g. an upstream SDK. */
      related: z.array(z.object({ label: z.string(), url: z.url() })).default([]),
      recognition,
      relatedPublications: z.array(reference('publications')).default([]),
      heroImage: z
        .object({
          src: image(),
          alt: z.string(),
          caption: z.string().optional(),
        })
        .optional(),
      /** Frames for the Projects showreel, with a short caption each (e.g. "Nested Teapot"). */
      gallery: z.array(z.object({ src: image(), alt: z.string(), caption: z.string().optional() })).default([]),
      /** A lead video. Local files live in public/; YouTube accepts an ID or URL. */
      video: z
        .discriminatedUnion('type', [
          z.object({
            type: z.literal('local'),
            src: z.string().startsWith('/'),
            title: z.string(),
            poster: image().optional(),
            width: z.number().int().positive().default(1920),
            height: z.number().int().positive().default(1080),
            mimeType: z.string().default('video/mp4'),
            caption: z.string().optional(),
            captions: z
              .object({ src: z.string().startsWith('/'), srclang: z.string(), label: z.string() })
              .optional(),
          }),
          z.object({
            type: z.literal('youtube'),
            id: z.string(),
            title: z.string(),
            /** A frame of the video; the player then loads only when the reader presses Play. */
            poster: image().optional(),
            caption: z.string().optional(),
          }),
        ])
        .optional(),
      /**
       * Private authoring note for planned media. It is not displayed as an
       * empty slot on the published page.
       */
      mediaSlot: z.string().optional(),
    }),
});

/** Articles. New posts start as drafts; set `draft: false` and a `date` to publish. */
const writing = defineCollection({
  loader: glob({ base: './src/content/writing', pattern: '**/*.{md,mdx}' }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string(),
        description: z.string(),
        kind: z.enum(['blog', 'technical', 'personal']).default('blog'),
        draft: z.boolean().default(true),
        /** Publication date. Required once `draft` is false. */
        date: z.coerce.date().optional(),
        updated: z.coerce.date().optional(),
        tags: z.array(z.string()).default([]),
        relatedWork: z.array(reference('work')).default([]),
        /** Optional preview image for links shared on social sites and chat apps. */
        image: z.object({ src: image(), alt: z.string() }).optional(),
      })
      .refine((post) => post.draft || post.date, {
        message: 'A published post (draft: false) needs a `date`.',
        path: ['date'],
      }),
});

/**
 * Scholarly outputs, with bibliographic data copied from the publisher.
 * Never generate a DOI or BibTeX entry; paste them verbatim or leave them out.
 */
const publications = defineCollection({
  loader: glob({ base: './src/content/publications', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    /** In published order, spelled exactly as on the publication. */
    authors: z.array(z.string()).min(1),
    type: z.enum(['paper', 'poster', 'talk', 'demo', 'thesis', 'preprint', 'report']),
    /** e.g. "SIGGRAPH 2026 Posters" */
    venue: z.string(),
    year: z.number().int(),
    /** Extra detail shown after the venue, e.g. "Poster and live demo". */
    note: z.string().optional(),
    /** An award the publication won, worded as given, e.g. "Best Paper Award". */
    award: z.string().optional(),
    draft: z.boolean().default(false),
    /** Bare DOI such as 10.1145/1234567.1234568, only when issued. */
    doi: z.string().regex(/^10\.\d{4,9}\/\S+$/).optional(),
    links: z
      .object({
        paper: z.url(),
        publisher: z.url(),
        code: z.url(),
        video: z.url(),
        slides: z.url(),
        poster: z.url(),
        supplemental: z.url(),
      })
      .partial()
      .default({}),
    bibtex: z.string().optional(),
  }),
});

/**
 * Runnable visual experiments. `url` is either a demo built by this repo from
 * demos/<id>/ (then it must be exactly /lab/<id>/, and the demo gets an embed
 * page at /demos/<id>/), or a full URL to one hosted elsewhere, e.g. ShaderToy.
 */
const demos = defineCollection({
  loader: glob({ base: './src/content/demos', pattern: '**/*.{md,mdx}' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      url: z.union([z.url(), z.string().regex(/^\/lab\/[a-z0-9-]+\/$/)]),
      /** Optional official ShaderToy iframe URL, preserving its playback options. */
      embedUrl: z.url().refine((value) => {
        const url = new URL(value);
        return url.protocol === 'https:' &&
          ['shadertoy.com', 'www.shadertoy.com'].includes(url.hostname) &&
          /^\/embed\/[A-Za-z0-9]{6}\/?$/.test(url.pathname);
      }, 'Use an https://www.shadertoy.com/embed/<id> URL.').optional(),
      /** Name of the external host, shown next to the link (e.g. "ShaderToy"). */
      host: z.string().optional(),
      draft: z.boolean().default(false),
      date: z.coerce.date().optional(),
      /** Browser features the demo needs, shown to visitors, e.g. ["WebGL 2"]. */
      requires: z.array(z.string()).default([]),
      technologies: z.array(z.string()).default([]),
      /** Public source code. */
      source: z.url().optional(),
      recognition,
      /** The larger piece of work this demo belongs to, if any. */
      work: reference('work').optional(),
      thumbnail: z.object({ src: image(), alt: z.string() }).optional(),
      /** Frames for the Projects showreel, with a short caption each (e.g. "Nested Teapot"). */
      gallery: z.array(z.object({ src: image(), alt: z.string(), caption: z.string().optional() })).default([]),
    }),
});

export const collections = { work, writing, publications, demos };
