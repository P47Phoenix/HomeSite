import { defineConfig } from 'vite';

// Minimal config: index.html entry, content-hashed assets and CSS extraction are
// vite defaults. scripts/prerender.tsx post-processes dist/ into the zero-JS artifact.
export default defineConfig({
  build: {
    assetsDir: 'assets',
  },
});
