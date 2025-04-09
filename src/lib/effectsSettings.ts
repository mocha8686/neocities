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

export const effectsHash = hashEffectKeys(effects);
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
	const hashKey = 'settingsHash';
	const settingsKey = 'settings';

	const settingsString = window.localStorage.getItem(settingsKey);
	if (!settingsString) {
		effectsSettings.set(defaults);
		window.localStorage.setItem(settingsKey, JSON.stringify(defaults));
		window.localStorage.setItem(hashKey, effectsHash);
		return;
	}

	const hash = window.localStorage.getItem(hashKey);
	if (!hash || hash !== effectsHash) {
		window.localStorage.setItem(hashKey, effectsHash);

		const oldSettings: Record<string, boolean> = JSON.parse(settingsString);
		const keys = Object.keys(effectsSettings.get());

		const migratedSettings = Object.entries(oldSettings).filter(
			([key]) => key in keys,
		);

		for (const [key, value] of migratedSettings) {
			// @ts-ignore
			effectsSettings.setKey(key, value);
		}

		return;
	}

	const settings = JSON.parse(settingsString);
	for (const [key, value] of Object.entries(settings)) {
		// @ts-ignore
		effectsSettings.setKey(key, value);
	}
}

function hashEffectKeys(keys: Readonly<string[]>): string {
	return JSON.stringify(keys);
}
