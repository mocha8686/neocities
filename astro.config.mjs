// @ts-check
import { defineConfig } from 'astro/config';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

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
});
