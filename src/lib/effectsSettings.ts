import { map } from 'nanostores';

export const effects = ['rain', 'CRT', 'marquee'] as const;
export type Effects = (typeof effects)[number];

export type EffectsMap = Record<Effects, boolean>;

export const effectsSettings = map<EffectsMap>({
	rain: true,
	CRT: false,
	marquee: true,
});

export function getSetting(effect: Effects): boolean {
	return effectsSettings.get()[effect];
}

export function setSetting(effect: Effects, value: boolean) {
	effectsSettings.setKey(effect, value);
}

export function toggleClass(
	value: boolean,
	elements: HTMLElement[] | NodeListOf<Element>,
	disabledClass: string,
) {
	if (value) {
		for (const element of elements) {
			element.classList.remove(disabledClass);
		}
	} else {
		for (const element of elements) {
			element.classList.add(disabledClass);
		}
	}
}
