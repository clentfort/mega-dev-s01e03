import { fileURLToPath } from 'node:url';
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';
import { mdsvex } from 'mdsvex';

export default defineConfig({
  plugins: [sveltekit({
    adapter: adapter(),
    extensions: ['.svelte', '.svx'],
    preprocess: [vitePreprocess(), mdsvex({
      extensions: ['.svx'],
      layout: { runbook: fileURLToPath(new URL('./src/lib/layouts/runbook.svelte', import.meta.url)) },
    })],
  })],
  server: { host: '127.0.0.1', strictPort: true },
  preview: { host: '127.0.0.1', port: 4173, strictPort: true },
});
