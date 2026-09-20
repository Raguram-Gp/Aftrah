// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://aftrah.vercel.app',
  server: {
    host: true,
  },
  integrations: [
    react(),
    sitemap({
      filter: (page) =>
        !page.includes('/afrah-app') &&
        !page.includes('/aftrah-app') &&
        !page.includes('/s') &&
        !page.includes('/404'),
    }),
  ],
});

