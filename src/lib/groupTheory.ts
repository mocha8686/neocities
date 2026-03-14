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

