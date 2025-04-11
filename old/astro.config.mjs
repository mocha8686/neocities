// @ts-check
import { defineConfig } from 'astro/config';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import svelte from '@astrojs/svelte';
import mdx from '@astrojs/mdx';

import remarkMath from 'remark-math';
import remarkDirective from 'remark-directive';
import remarkRubyDirective from 'remark-ruby-directive';

import rehypeKatex from 'rehype-katex';

const __dirname = dirname(fileURLToPath(import.meta.url));

// https://astro.build/config
export default defineConfig({
	prefetch: {
		prefetchAll: true,
	},

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
		remarkPlugins: [remarkMath, remarkDirective, remarkRubyDirective],
		rehypePlugins: [rehypeKatex],
	},

	integrations: [svelte(), mdx()],
});
