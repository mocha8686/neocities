import rss, { type RSSFeedItem } from '@astrojs/rss';
import type { APIRoute } from 'astro';

import { generateRSSItems as blogRSS } from '$src/lib/blog';
import { generateRSSItems as cryptopalsRSS } from '$src/lib/cryptopals';
import { generateRSSItems as groupTheoryRSS } from '$src/lib/groupTheory';

// TODO: autodiscovery (https://www.rssboard.org/rss-autodiscovery)

export const GET = (async ({ site }) => {
	if (!site) {
		throw ReferenceError("`site` should be set in Astro's config.");
	}

	return rss({
		title: 'have you seen her?',
		description:
			'Updates from all across my personal site, from blog posts to public learning.',
		site,
		items: await getRSSItems(),
	});
}) satisfies APIRoute;

async function getRSSItems() {
	const feeds = {
		'Group Theory': groupTheoryRSS(),
		Blog: blogRSS(),
		cryptopals: cryptopalsRSS(),
	};

	const cmpNewestFirst = (a: RSSFeedItem, b: RSSFeedItem) =>
		b.pubDate!.getTime() - a.pubDate!.getTime();

	const settledFeeds = await resolveObject(feeds);
	const labeledFeeds = Object.entries(settledFeeds).flatMap(
		([feedTitle, items]) =>
			items.map(item => {
				item.title = `${feedTitle} – ${item.title}`;
				return item;
			}),
	);
	return labeledFeeds.toSorted(cmpNewestFirst);
}

async function resolveObject<T>(
	obj: Record<string, Promise<T>>,
): Promise<Record<string, T>> {
	return Promise.all(
		Object.entries(obj).map(async ([k, v]) => [k, await v]),
	).then(Object.fromEntries);
}
