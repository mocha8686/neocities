import type { Alpine } from 'alpinejs';

const TEXT_SPEED = 100;
const TEXT_DELAY = 2000;
const CHOICE_DELAY = 750;
const ELLIPSIS_DELAY = 5000;

const RESUME_TEXT = "you're back...";
const BULLET = '♡';
const DIVIDER = '. ₊ ⊹ .  ⟡  . ⊹ ₊ .';

export const CHOICES_KEY = 'our_journey';
export const INDEX_KEY = 'our_steps';
export const STATE_KEY = 'our_place';

export type Text = string[];
export type Choices = Record<string, Entry>;

export interface Entry {
	choices?: Choices;
	text: Text;
}

export type NodeEntry = string | { [key: string]: Node };
export type Node = NodeEntry[];

export function parseNode(node: Node): Entry {
	const res: Entry = { text: [] };

	for (const entry of node) {
		if (typeof entry === 'string') {
			res.text.push(entry);
		} else {
			if (!res.choices) {
				res.choices = {};
			}
			for (const [choice, node] of Object.entries(entry)) {
				res.choices[choice] = parseNode(node);
			}
		}
	}

	return res;
}

export function resume(
	root: Entry,
	choices: string[],
	i: number,
): [number, Entry] | null | undefined {
	if (i < 0) return null;

	const entry = choices.reduce<Entry | undefined>(
		(entry, choice) => entry?.choices?.[choice],
		root,
	);
	if (!entry) {
		return undefined;
	}

	if (i >= entry.text.length) {
		return undefined;
	}

	if (i + 1 === entry.text.length && !entry.choices) {
		return null;
	}

	console.log(RESUME_TEXT);
	return [i, entry];
}

export function displayEntry(Alpine: Alpine, entry: Entry, i = 0) {
	if (i < 0 || i >= entry.text.length) {
		throw new Error(
			`index ${i} out of range for text of length ${entry.text.length}`,
		);
	}

	setStoredIndex(i);

	const line = entry.text[i];
	const isLast = i + 1 === entry.text.length;

	if (line === 'what am i supposed to do...?') {
		// @ts-expect-error ignore implicit any
		Alpine.store('state').value = 'cascading feelings';
	}

	if (isLast) {
		if (entry.choices) {
			const text = formatLast(line, entry.choices);
			console.log(text);
			mountChoices(Alpine, entry.choices);
		} else {
			console.log(line);
		}
	} else {
		console.log(line);
		const timeout =
			line === '...' ? ELLIPSIS_DELAY : line.length * TEXT_SPEED + TEXT_DELAY;timeoutlineELLIPSIS_DELAY
		setTimeout(() => displayEntry(Alpine, entry, i + 1), timeout);
	}
}

function formatLast(last: string, choices: Choices) {
	const choicesText = Object.keys(choices)
		.map(choice => `${BULLET} ${choice}()`)
		.join('\n');
	return `${last}\n\n${choicesText}`;
}

function unmountChoices(choices: Choices) {
	for (const choice of Object.keys(choices)) {
		// @ts-expect-error ignore implicit any
		delete window[choice];
	}
}

function mountChoices(Alpine: Alpine, choices: Choices) {
	for (const [choice, entry] of Object.entries(choices)) {
		// @ts-expect-error ignore implicit any
		window[choice] = () => {
			if (choice === 'you_have_to_decide_for_yourself') {
				clearStore();
				// @ts-expect-error ignore missing store key
				Alpine.store('state').value = 'alleyway';
				window.location.assign('/alleyway/');
			}
			unmountChoices(choices);
			setTimeout(() => {
				appendStoredChoices(choice);
				displayEntry(Alpine, entry);
			}, CHOICE_DELAY);
			return DIVIDER;
		};
	}
}

function appendStoredChoices(choice: string) {
	const choices = window.localStorage.getItem(CHOICES_KEY);
	let newChoices;
	if (choices) {
		newChoices = `${choices},${choice}`;
	} else {
		newChoices = choice;
	}
	window.localStorage.setItem(CHOICES_KEY, newChoices);
}

function setStoredIndex(i: number) {
	window.localStorage.setItem(INDEX_KEY, i.toString());
}

export function getStoredChoices(): string[] {
	const choices = window.localStorage.getItem(CHOICES_KEY);
	if (!choices) return [];
	return choices.split(',');
}

export function getStoredIndex(): number {
	const index = window.localStorage.getItem(INDEX_KEY);
	if (!index) return 0;
	return parseInt(index);
}

export function clearStore() {
	window.localStorage.removeItem(CHOICES_KEY);
	window.localStorage.removeItem(INDEX_KEY);
}
