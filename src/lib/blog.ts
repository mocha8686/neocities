import { getCollection } from "astro:content";

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
		'Oct','Nov','Dec',
	];

	const day = date.getUTCDate();
	const month = months[date.getUTCMonth()];
	const year = date.getUTCFullYear();

	return `${month}. ${day}, ${year}`;
}

export async function getSortedBlogPosts() {
	const posts = await getCollection('blog');
	type Blog = typeof posts[number];

	function cmp(a: Blog, b: Blog): number {
		return a.data.date.getTime() - b.data.date.getTime();
	}

	const sorted = posts.toSorted(cmp);
	return sorted;
}
