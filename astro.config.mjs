// @ts-check

import mdx from '@astrojs/mdx';
import vercel from '@astrojs/vercel';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import keystatic from '@keystatic/astro';
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://takeisa.dev',
  output: 'server',
  adapter: vercel(),
  integrations: [mdx(), sitemap(), react(), keystatic()],

  security: {
    allowedDomains: [
      { hostname: 'takeisa.dev', protocol: 'https' },
      { hostname: 'www.takeisa.dev', protocol: 'https' },
    ],
  },

  vite: {
    plugins: [tailwindcss()],
  },
});