import pluginWebc from '@11ty/eleventy-plugin-webc';
import EleventyVitePlugin from '@11ty/eleventy-plugin-vite';
import path from 'node:path';

/** @param {import('@11ty/eleventy').UserConfig} eleventyConfig */
export default function config(eleventyConfig) {
	eleventyConfig.addPlugin(EleventyVitePlugin, {
		viteOptions: {
			resolve: {
				alias: {
					'/node_modules': path.resolve('.', 'node_modules'),
					'/lib': path.resolve('.', 'lib'),
					'/assets': path.resolve('.', 'assets'),
				},
			},
		},
	});

	eleventyConfig.addPlugin(pluginWebc, {
		components: '_components/**/*.webc',
	});
}
