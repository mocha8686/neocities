// @ts-check
import alpinejs from '@astrojs/alpinejs';
import { defineConfig, fontProviders } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	integrations: [alpinejs()],
	trailingSlash: 'always',
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
		],
	},
});
