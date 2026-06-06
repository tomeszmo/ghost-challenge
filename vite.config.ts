import { defineConfig } from 'vite';

export default defineConfig({
  // Update '/challengeghost/' to match your GitHub repo name before deploying
  base: '/challengeghost/',
  build: {
    outDir: 'dist',
    target: 'es2022',
  },
});
