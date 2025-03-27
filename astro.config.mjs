// @ts-check
import { defineConfig } from 'astro/config';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import svelte from '@astrojs/svelte';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

const __dirname = dirname(fileURLToPath(import.meta.url));

// https://astro.build/config
export default defineConfig({
	build: {
		format: 'file',
	},

	vite: {
		ssr: {
			noExternal: ['normalize.css'],
		},
		resolve: {
			alias: { $: path.resolve(__dirname, './src') },
		},
	},

	markdown: {
		remarkPlugins: [remarkMath],
		rehypePlugins: [rehypeKatex],
	},

	integrations: [svelte()],
});
