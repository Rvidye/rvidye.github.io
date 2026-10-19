---
title: Shader study
description: An editable GLSL fragment shader, a ray-marched sphere with soft shadows, that recompiles as you type.
url: /lab/shader-study/
date: 2026-10-17
requires: [WebGL 2]
technologies: [WebGL 2, GLSL, TypeScript, Vite]
---

A small, self-contained example of how demos on this site are built: an independent Vite app in `demos/shader-study/`, compiled to `/lab/shader-study/` before the site is built, and embedded here.

Edit the shader source under the image. Changes compile a quarter of a second after you stop typing. If the new code doesn't compile, the errors appear below the editor, with the editor's line numbers, and the last working version keeps running.

The animation pauses when the demo is scrolled out of view or the tab is hidden, and starts paused if your system asks for reduced motion. Rendering is capped at twice the screen's pixel density and about two million pixels. Without WebGL 2, the demo says so instead of showing an empty frame.
