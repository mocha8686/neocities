import type { RSSFeedItem } from '@astrojs/rss';
import { type CollectionEntry, getCollection } from 'astro:content';
export type Unit = CollectionEntry<'groupTheory'>;
export type MaybeUnit = Unit | undefined;

export async function getPrevAndNext(
	current: number,
): Promise<[MaybeUnit, MaybeUnit]> {
	const units = await getCollection('groupTheory');
	const prev = units.find(unit => unit.data.number === current - 1);
	const next = units.find(unit => unit.data.number === current + 1);
	return [prev, next];
}

export async function generateRSSItems(): Promise<RSSFeedItem[]> {
	const units = await getCollection('groupTheory');
	return units.map(unit => ({
		title: unit.data.title,
		pubDate: unit.data.date,
		description: unit.data.description,
		link: `/learning/group-theory/${unit.id}/`,
	}));
}

export async function getPublishedUnits(): Promise<CollectionEntry<'groupTheory'>[]> {
	const units = await getCollection('groupTheory');
	return import.meta.env.PROD && units.filter(unit => !unit.data.draft) || units;
}
