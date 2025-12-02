const TEXT_SPEED = 100;
const TEXT_DELAY = 2000;
const CHOICE_DELAY = 750;
const ELLIPSIS_DELAY = 5000;

const BULLET = '♡';
const DIVIDER = '. ݁₊ ⊹ . ݁ ⟡ ݁ . ⊹ ₊ ݁.';

export type Text = string[];
export type Choices = Record<string, Entry>;

export interface Entry {
	text: Text;
	choices?: Choices;
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

export function displayEntry(entry: Entry, i = 0) {
	if (i < 0 || i >= entry.text.length) {
		throw new Error(
			`index ${i} out of range for text of length ${entry.text.length}`,
		);
	}

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
			setTimeout(() => displayEntry(entry), CHOICE_DELAY);
			return DIVIDER;
		};
	}
}
