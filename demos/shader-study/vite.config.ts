import { defineConfig } from 'vite';

export default defineConfig({
  // Relative asset URLs, so the build works at /lab/shader-study/ or on any other host.
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2022',
  },
});
