import { glob } from 'astro/loaders';
import { defineCollection, z } from 'astro:content';

const mdPattern = '**/[^_]*.md';

const mathReview = z.object({
	type: z.literal('math'),
	expression: z.string(),
});

const reviews = defineCollection({
	loader: glob({ pattern: mdPattern, base: './src/data/reviews' }),
	schema: z.object({
		title: z.string(),
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		thing: z.discriminatedUnion('type', [mathReview]),
	}),
});

const cats = defineCollection({
	loader: glob({ pattern: mdPattern, base: './src/data/cats' }),
});

const blog = defineCollection({
	loader: glob({ pattern: mdPattern, base: './src/data/blog' }),
	schema: z.object({
		date: z.coerce.date(),
	}),
});

export const collections = { reviews, cats, blog };
