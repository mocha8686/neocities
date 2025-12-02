// @ts-check
import alpinejs from '@astrojs/alpinejs';
import yaml from '@rollup/plugin-yaml';
import { defineConfig, fontProviders } from 'astro/config';
import remarkRuby from 'remark-ruby';

// https://astro.build/config
export default defineConfig({
	integrations: [alpinejs({ entrypoint: '/src/lib/entrypoint' })],
	trailingSlash: 'always',
	markdown: {
		remarkPlugins: [remarkRuby],
		shikiConfig: {
			theme: 'houston',
		},
	},
	vite: {
		plugins: [yaml()],
	},
	experimental: {
		fonts: [
			{
				provider: fontProviders.bunny(),
				name: 'Shippori Mincho',
				cssVariable: '--font-shippori-mincho',
				weights: [400],
				fallbacks: ['MS Mincho', 'Times New Roman', 'serif'],
			},
			{
				provider: fontProviders.bunny(),
				name: 'Zen Old Mincho',
				cssVariable: '--font-zen-old-mincho',
				weights: [400, 700],
				fallbacks: ['MS Mincho', 'serif'],
			},

			// cryptopals
			{
				provider: fontProviders.bunny(),
				name: 'Fira Code',
				cssVariable: '--font-fira-code',
				weights: [400],
				fallbacks: ['monospace'],
			},
			{
				provider: fontProviders.bunny(),
				name: 'Blinker',
				cssVariable: '--font-blinker',
				weights: [300, 600],
				fallbacks: ['Ubuntu', 'sans-serif'],
			},
		],
	},
});
