import EleventyVitePlugin from '@11ty/eleventy-plugin-vite';
import eleventyWebcPlugin from '@11ty/eleventy-plugin-webc';
import eleventyNavigationPlugin from '@11ty/eleventy-navigation';
import { eleventyImagePlugin } from '@11ty/eleventy-img';

import markdownItTaskCheckbox from 'markdown-it-task-checkbox';
import markdownItRuby from 'markdown-it-ruby';
import { katex as markdownItKatex } from '@mdit/plugin-katex';

import path from 'node:path';
import katex from 'katex';
import dayjs from 'dayjs';
import utcPlugin from 'dayjs/plugin/utc.js';

dayjs.extend(utcPlugin);

/** @param {import('@11ty/eleventy').UserConfig} eleventyConfig */
export default function (eleventyConfig) {
	eleventyConfig.addFilter('math', expr => katex.renderToString(expr, { displayMode: true }));

	eleventyConfig.addJavaScriptFunction('formatDate', jsDate => dayjs.utc(jsDate).format('YYYY MMM D'));

	eleventyConfig.amendLibrary('md', mdLib => {
		mdLib.use(markdownItTaskCheckbox);
		mdLib.use(markdownItRuby);
		mdLib.use(markdownItKatex);
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
