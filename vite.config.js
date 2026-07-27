import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    allowedHosts: ['terminal.local']
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        recipes: resolve(import.meta.dirname, 'recipes.html'),
        journal: resolve(import.meta.dirname, 'journal.html'),
        rotationalGrazing: resolve(import.meta.dirname, 'why-rotational-grazing-matters.html'),
        beefBox: resolve(import.meta.dirname, 'what-comes-in-a-beef-box.html'),
        localBeef: resolve(import.meta.dirname, 'why-buy-local-beef.html'),
        beefCuts: resolve(import.meta.dirname, 'know-your-beef-cuts.html')
      }
    }
  }
});
