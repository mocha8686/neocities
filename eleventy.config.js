import EleventyVitePlugin from '@11ty/eleventy-plugin-vite';
import eleventyWebcPlugin from '@11ty/eleventy-plugin-webc';
import eleventyNavigationPlugin from '@11ty/eleventy-navigation';
import { eleventyImagePlugin } from '@11ty/eleventy-img';

import markdownItTaskCheckbox from 'markdown-it-task-checkbox';
import markdownItRuby from 'markdown-it-ruby';

import path from 'node:path';

/** @param {import('@11ty/eleventy').UserConfig} eleventyConfig */
export default function (eleventyConfig) {
	eleventyConfig.amendLibrary('md', mdLib => {
		mdLib.use(markdownItTaskCheckbox);
		mdLib.use(markdownItRuby);
	});

	eleventyConfig.addPlugin(eleventyNavigationPlugin);

	eleventyConfig.addPlugin(eleventyWebcPlugin, {
		components: ['_components/**/*.webc', 'npm:@11ty/eleventy-img/*.webc'],
	});

	eleventyConfig.addPlugin(eleventyImagePlugin, {
		formats: ['webp', 'jpeg'],
		urlPath: '/img/',

		formatFiltering: ['animated'],
		sharpOptions: {
			animated: true,
		},

		defaultAttributes: {
			loading: 'lazy',
			decoding: 'async',
		},
	});

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
}
