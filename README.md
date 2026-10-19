# Personal website

Rushikesh Vidye’s personal site for research, projects, blog posts, demos, and life notes. Static Astro + Markdown/MDX + plain CSS. Nothing has been published by the design revision.

## Work locally

Use Node 22.22+ on an even-numbered release line and npm.

```sh
npm install
npm run dev -- --host 127.0.0.1
```

Open the exact URL printed by the server. The homepage is at `/`, all research and projects at `/projects/`, posts at `/blog/`, and interactive work at `/demos/`.

```sh
npm run build
npm run preview -- --host 127.0.0.1
```

The build checks types/content and generates `dist/`. Drafts and all `/dev/` preview pages are excluded. `npm run check` runs the type/content check on its own.

## Design

A personal home with a conversational introduction, a real photograph, current updates, useful references, and handpicked paths into the site. Warm paper, forest green, and rust continue across the archives and detail pages. Long pages retain readable type and wide media.

Edit the introduction in `src/content/home/intro.md`, the persistent **Lately** note in `now.md`, **Follow a thread** selections in `explore.md`, and the link shelf in `links.md`. The homepage also shows up to three recent published posts when available. Its selections can include older or completed work; `featured` and `status` do not determine them. The showreel now lives on **Projects**, using the existing `showreel` list in `intro.md`.

## Content and templates

See [CONTENT_GUIDE.md](CONTENT_GUIDE.md) for copyable personal project, research project, blog, technical post, and personal note templates. In development, `/dev/templates/` shows the five shared layouts. These previews never become public content.

- `src/content/work/`: research, personal projects, experiments; one record per project.
- `src/content/writing/`: every kind of blog post, including personal notes.
- `src/content/publications/`: publication metadata linked to research.
- `src/content/demos/`: genuine demos, including externally hosted ShaderToy work.
- `src/content/home/`: the introduction, current update, curated threads, useful links, and About bio.
- `templates/`: starting files to copy into the appropriate collection.
- `src/layouts/ProjectPage.astro`, `WorkLayout.astro`, `ArticleLayout.astro`: shared detail layouts.
- `src/components/Video.astro`, `YouTube.astro`, `ShaderToy.astro`: media embeds.
- `src/styles/`: colors, typography, spacing, and article styles. `tokens.css` holds the light and dark palettes; the dark one follows the system setting until the reader picks a theme with the switch in the header (remembered in `localStorage`).
- `src/lib/site.ts`: name, navigation, contact links.
- `src/content/home/bio.md`, `src/lib/cv.ts`, `src/assets/about/`: the About page's bio, CV, and photos.
- `public/favicon.svg`: the Utah teapot logo, also drawn in `src/components/Header.astro`. Run `npm run icons` after changing it.

Existing `/work/<id>/` project links remain stable. Old `/research/`, `/writing/`, and `/playground/` links redirect to the renamed sections. Drafts are visible and labelled locally, but absent from the homepage, feed, and production output.

The old shader editor source remains in `demos/shader-study/` as a scaffold. It is excluded from automatic builds and all site listings; previous generated output is kept only in the ignored `.local/` folder. The Demos index and MayaSabha detail page show the MayaSabha render with a Run button that loads the actual ShaderToy player, using the supplied URL and playback settings. An older OpenVDB project demonstrates the YouTube lead-video layout. See [demos/README.md](demos/README.md) for optional standalone demos.

## Publishing

The existing GitHub Actions workflow builds pull requests and publishes pushes to `main` on GitHub Pages, once Pages is enabled for the repository. `astro.config.mjs` retains `https://rvidye.github.io` as the canonical site URL. No domain or hosting changes are needed to review this locally.

Fonts download at build time. Native videos belong in `public/media/`; images in `src/assets/` are optimized by Astro. GitHub Pages cannot supply headers for threaded WASM demos needing cross-origin isolation. There is no analytics, backend, or client framework.
