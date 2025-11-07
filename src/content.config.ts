import { file, glob } from 'astro/loaders';
import { defineCollection, z } from 'astro:content';

const quotes = defineCollection({
	loader: file('src/data/quotes.txt', {
		parser: text =>
			text
				.trim()
				.split('\n')
				.map((quote, id) => ({ id, quote })),
	}),
	schema: z.object({
		id: z.number(),
		quote: z.string(),
	}),
});

const aboutTabs = defineCollection({
	loader: glob({ pattern: '**/*.md', base: 'src/data/about' }),
	schema: z.object({
		id: z.string(),
		sortOrder: z.number(),
	}),
});

export const collections = {
	aboutTabs,
	quotes,
};
