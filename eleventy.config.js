import pluginWebc from '@11ty/eleventy-plugin-webc';
import EleventyVitePlugin from '@11ty/eleventy-plugin-vite';

/** @param {import('@11ty/eleventy').UserConfig} eleventyConfig */
export default function config(eleventyConfig) {
	eleventyConfig.addPassthroughCopy('assets')

	eleventyConfig.addPlugin(EleventyVitePlugin);

	eleventyConfig.addPlugin(pluginWebc, {
		components: '_components/**/*.webc',
	});
}
