import { file } from 'astro/loaders';
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

export const collections = { quotes };
