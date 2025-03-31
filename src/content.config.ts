import { file, glob } from 'astro/loaders';
import { defineCollection, z } from 'astro:content';

const mathReview = z.object({
	type: z.literal('math'),
	expression: z.string(),
});

const reviews = defineCollection({
	loader: glob({ pattern: '**/[^_]*.md', base: './src/data/reviews' }),
	schema: z.object({
		title: z.string(),
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		thing: z.discriminatedUnion('type', [mathReview]),
	}),
});

const statuses = defineCollection({
	loader: file('./src/data/statuses.json'),
	schema: z.object({
		status: z.string(),
		icon: z.string(),
		timestamp: z.coerce.date(),
	}),
});

export const collections = { reviews, statuses };
