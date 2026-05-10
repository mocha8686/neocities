import { getCollection } from 'astro:content';
import type { RSSFeedItem } from '@astrojs/rss';

export async function generateRSSItems(): Promise<RSSFeedItem[]> {
	const sets = await getCollection('cryptopals');
	return sets.map((set) => ({
		title: set.data.title,
		description: set.data.description,
		pubDate: set.data.date,
		link: `/learning/cryptopals/${set.id}`,
	}));
}
