import { type CollectionEntry, getCollection } from 'astro:content';

export type Tab = CollectionEntry<'aboutTabs'>;

export const getSortedTabs = async () => {
	const getSortProperty = (tab: Tab) => tab.data.sortOrder;

	const tabs = await getCollection('aboutTabs');
	const sorted = tabs.toSorted(
		(a, b) => getSortProperty(a) - getSortProperty(b),
	);
	return sorted;
};

export const getTabName = (tab: Tab) => tab.data.id;
