import { type CollectionEntry, getCollection } from 'astro:content';

export function formatDate(date: Date): string {
	const months = [
		'Jan',
		'Feb',
		'Mar',
		'Apr',
		'May',
		'Jun',
		'Jul',
		'Aug',
		'Sep',
		'Oct',
		'Nov',
		'Dec',
	];

	const day = date.getUTCDate();
	const month = months[date.getUTCMonth()];
	const year = date.getUTCFullYear();

	return `${month}. ${day}, ${year}`;
}

export async function getSortedBlogPosts(): Promise<CollectionEntry<'blog'>[]> {
	const posts = await getCollection('blog');
	type Blog = (typeof posts)[number];

	function cmp(a: Blog, b: Blog): number {
		return b.data.date.getTime() - a.data.date.getTime();
	}

	const sorted = posts.toSorted(cmp);
	return sorted;
}

export async function getLatestBlogPost(): Promise<CollectionEntry<'blog'>> {
	const posts = await getSortedBlogPosts();
	const mostRecent = posts.at(0)!;
	return mostRecent;
}
