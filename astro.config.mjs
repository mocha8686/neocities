// @ts-check
import alpinejs from '@astrojs/alpinejs';
import yaml from '@rollup/plugin-yaml';
import { defineConfig, fontProviders } from 'astro/config';
import rehypeKatex from 'rehype-katex';
import remarkDirective from 'remark-directive';
import remarkMath from 'remark-math';
import remarkRuby from 'remark-ruby';

import remarkColors from './src/lib/remarkColors';

// https://astro.build/config
export default defineConfig({
	site: 'https://mocha8686.neocities.org',
	integrations: [alpinejs({ entrypoint: '/src/lib/entrypoint' })],
	trailingSlash: 'always',
	markdown: {
		remarkPlugins: [remarkRuby, remarkMath, remarkDirective, remarkColors],
		rehypePlugins: [rehypeKatex],
		shikiConfig: {
			theme: 'css-variables',
		},
	},
	vite: {
		plugins: [yaml()],
	},
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
			name: 'Kode Mono',
			cssVariable: '--font-kode-mono',
			weights: [400],
			fallbacks: ['monospace'],
		},
		{
			provider: fontProviders.bunny(),
			name: 'Rajdhani',
			cssVariable: '--font-rajdhani',
			weights: [500],
			fallbacks: ['Ubuntu', 'sans-serif'],
		},

		// alleyway
		{
			provider: fontProviders.local(),
			name: 'RodinNTLG',
			cssVariable: '--font-rodin',
			options: {
				variants: [
					{
						weight: 600,
						style: 'normal',
						src: ['./src/assets/alleyway/RodinNTLG Pro DB.otf'],
					},
					{
						weight: 700,
						style: 'normal',
						src: ['./src/assets/alleyway/RodinNTLG Pro B.otf'],
					},
				],
			},
			fallbacks: ['Helvetica', 'Calibri', 'sans-serif'],
		},

		// math
		{
			provider: fontProviders.bunny(),
			name: 'Indie Flower',
			cssVariable: '--font-indie-flower',
			fallbacks: [
				'Tahoma',
				'Verdana',
				'Geneva',
				'Arial',
				'Helvetica',
				'sans-serif',
			],
		},
	],
});
