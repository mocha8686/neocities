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

const quizResults = defineCollection({
	loader: file('src/data/quizResults.json'),
	schema: z.object({
		id: z.string(),
		image: z.string(),
		link: z.string(),
	}),
});

const inspo = defineCollection({
	loader: file('src/data/inspo.json'),
	schema: z.object({
		id: z.string(),
		link: z.string(),
		image: z.string(),
		alt: z.string().optional(),
	}),
});

const blog = defineCollection({
	loader: glob({base: 'src/data/blog', pattern: '**/*.md'}),
	schema: z.object({
		id: z.string(),
		title: z.string(),
		headerImage: z.string(),
		date: z.coerce.date(),
		description: z.string(),
	}),
});

export const collections = {
	blog,
	inspo,
	quizResults,
	quotes,
};
