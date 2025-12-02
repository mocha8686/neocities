const TEXT_SPEED = 100;
const TEXT_DELAY = 2000;
const CHOICE_DELAY = 750;
const ELLIPSIS_DELAY = 5000;

const RESUME_TEXT = 'as i was saying...';
const BULLET = '♡';
const DIVIDER = '. ₊ ⊹ .  ⟡  . ⊹ ₊ .';

const CHOICES_KEY = 'our_journey';
const INDEX_KEY = 'our_steps';

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
): Entry | null {
	if (i < 0) return null;

	const entry = choices.reduce<Entry | undefined>(
		(entry, choice) => entry?.choices?.[choice],
		root,
	);
	if (!entry) {
		return null;
	}

	if (i >= entry.text.length) {
		return null;
	}

	const text = entry.text.slice(i);
	if (text.length > 1 || entry.choices) {
		text.unshift(RESUME_TEXT);
	}

	return {
		text,
		choices: entry.choices,
	};
}

export function displayEntry(entry: Entry, i = 0) {
	if (i < 0 || i >= entry.text.length) {
		throw new Error(
			`index ${i} out of range for text of length ${entry.text.length}`,
		);
	}

	setStoredIndex(i);

	const line = entry.text[i];
	const isLast = i + 1 === entry.text.length;

	if (isLast) {
		if (entry.choices) {
			const text = formatLast(line, entry.choices);
			console.log(text);
			mountChoices(entry.choices);
		} else {
			console.log(line);
		}
	} else {
		console.log(line);

		const timeout =
			line === '...' ? ELLIPSIS_DELAY : line.length * TEXT_SPEED + TEXT_DELAY;
		setTimeout(() => displayEntry(entry, i + 1), timeout);
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
		delete window[choice];
	}
}

function mountChoices(choices: Choices) {
	for (const [choice, entry] of Object.entries(choices)) {
		window[choice] = () => {
			unmountChoices(choices);
			setTimeout(() => {
				appendStoredChoices(choice);
				displayEntry(entry);
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
