# Demos

The site can embed real ShaderToy work, link to externally hosted demos, or embed a standalone app built here. It does not need its own shader editor.

For ShaderToy, add `src/content/demos/<id>.md` with a real `https://www.shadertoy.com/view/<shader-id>` URL. The entry appears at `/demos/<id>/` with the standard player and a direct link. An optional `embedUrl` preserves the official embed URL and its playback settings. ShaderToy may block embedded playback; the direct link remains available. Optional `work: <project-id>` links it to a project.

For an independent local app:

1. Put the app in `demos/<id>/` with its own `package.json` and committed lockfile.
2. Its `npm run build` must write `dist/index.html` and use relative asset URLs.
3. Add `src/content/demos/<id>.md` with `url: /lab/<id>/`.
4. Run the site’s `npm run build`. It copies the app into `public/lab/<id>/` and builds its detail page at `/demos/<id>/`.

Each demo keeps its dependencies separate from Astro. Generated `public/lab/` is ignored; do not hand-edit it. A local demo missing its built output fails the production build.

The previous `shader-study/` editor is retained as source only and skipped by default. It does not appear in Demos. You can inspect or explicitly build it with `npm run build:demos -- shader-study` if you need the scaffold later.

A demo should pause while hidden, respect reduced motion, provide useful browser-support fallbacks, and label its controls and canvas. Avoid automatic sound or expensive background rendering.

GitHub Pages cannot set COOP/COEP headers required by threaded WebAssembly. Use a single-threaded build or host that particular demo elsewhere.
