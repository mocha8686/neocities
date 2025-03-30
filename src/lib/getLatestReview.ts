import { getCollection } from 'astro:content';
import dayjs from 'dayjs';

export default async function getLatestReview() {
	type Unpacked<T> = T extends (infer U)[] ? U : T;

	const reviews = await getCollection('reviews');
	const latestReview = reviews.reduce<Unpacked<typeof reviews> | null>(
		(prev, current) =>
			prev && dayjs(prev.data.pubDate).isAfter(dayjs(current.data.pubDate))
				? prev
				: (current ?? current),
		null,
	);

	return latestReview;
}
