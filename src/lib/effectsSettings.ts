import { map } from 'nanostores';

export const effects = [
	'rain',
	'CRT chromatic abberation',
	'CRT flicker',
	'marquee',
] as const;

export const defaults = {
	rain: true,
	'CRT chromatic abberation': false,
	'CRT flicker': true,
	marquee: true,
};

export const effectsHash = JSON.stringify(effects);
export type Effects = (typeof effects)[number];

export type EffectsMap = Record<Effects, boolean>;

export const effectsSettings = map<EffectsMap>({
	rain: false,
	'CRT chromatic abberation': false,
	'CRT flicker': false,
	marquee: false,
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
