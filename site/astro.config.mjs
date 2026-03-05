import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  site: 'https://ash.rocktree.ai',
  output: 'static',
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        // Import editor from source during development/build
        '@rocktree/ash': path.resolve(__dirname, '../packages/editor/src/index.ts'),
      },
    },
  },
});
