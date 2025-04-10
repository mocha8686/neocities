import { map } from 'nanostores';

export const effects = [
	'rain',
	'CRT chromatic abberation',
	'CRT flicker',
	'marquee',
	'text animations',
] as const;

export const defaults: Record<Effects, boolean> = {
	rain: true,
	'CRT chromatic abberation': false,
	'CRT flicker': true,
	marquee: true,
	'text animations': true,
};

export type Effects = (typeof effects)[number];

export type EffectsMap = Record<Effects, boolean>;

const defaultValues: EffectsMap = effects.reduce((acc, effect) => {
	acc[effect] = false;
	return acc;
}, {} as EffectsMap);
export const effectsSettings = map<EffectsMap>(defaultValues);

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

export function loadSettings() {
	const settingsKey = 'settings';

	const settingsString = window.localStorage.getItem(settingsKey);
	if (!settingsString) {
		window.localStorage.setItem(settingsKey, JSON.stringify(defaults));
		effectsSettings.set(defaults);
		return;
	}

	try {
		const settings: Record<string, boolean> = JSON.parse(settingsString);

		for (const effect of effects) {
			if (effect in settings) {
				effectsSettings.setKey(effect, settings[effect]);
			} else {
				effectsSettings.setKey(effect, defaults[effect]);
			}
		}
	} catch {
		window.localStorage.setItem(settingsKey, JSON.stringify(defaults));
		effectsSettings.set(defaults);
	}
}
