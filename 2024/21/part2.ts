import { readFileLines } from "../shared";

class NumPadBot {
	static ButtonPos: Record<NumButton, [number, number]> = {
		A: [2, 3],
		"0": [1, 3],
		"1": [0, 2],
		"2": [1, 2],
		"3": [2, 2],
		"4": [0, 1],
		"5": [1, 1],
		"6": [2, 1],
		"7": [0, 0],
		"8": [1, 0],
		"9": [2, 0],
	};

	public readonly forbiddenX = 0;
	public readonly forbiddenY = 3;

	constructor(
		public x = 2,
		public y = 3,
	) {}

	*nextStep(btn: NumButton): Generator<string> {
		const currentX = this.x;
		const currentY = this.y;
		const [nextX, nextY] = NumPadBot.ButtonPos[btn];

		this.x = nextX;
		this.y = nextY;
		if (nextY === currentY) {
			// horizontal move
			if (nextX === currentX) {
				yield "A";
			} else {
				yield horizontalLine(currentX, nextX) + "A";
			}
		} else if (nextX === currentX) {
			// vertical move
			if (nextY === currentY) {
				yield "A";
			} else {
				yield verticalLine(currentY, nextY) + "A";
			}
		} else {
			if (currentY === this.forbiddenY && nextX === this.forbiddenX) {
				// This move must move around the forbidden corner
				yield horizontalLine(currentX, 1) + verticalLine(currentY, nextY) + horizontalLine(1, nextX) + "A";
				yield horizontalLine(currentX, 1) +
					verticalLine(currentY, 2) +
					horizontalLine(1, nextX) +
					verticalLine(2, nextY) +
					"A";
				yield verticalLine(currentY, nextY) + horizontalLine(currentX, nextX) + "A";
			} else if (currentX === this.forbiddenX && nextY === this.forbiddenY) {
				yield verticalLine(currentY, 2) + horizontalLine(currentX, nextX) + verticalLine(2, nextY) + "A";
				yield verticalLine(currentY, 2) +
					horizontalLine(currentX, 1) +
					verticalLine(2, nextY) +
					horizontalLine(1, nextX) +
					"A";
				yield horizontalLine(currentY, nextY) + verticalLine(currentX, nextX) + "A";
			} else {
				yield verticalLine(currentY, nextY) + horizontalLine(currentX, nextX) + "A";
				yield horizontalLine(currentX, nextX) + verticalLine(currentY, nextY) + "A";
			}
		}
	}

	clone(): NumPadBot {
		return new NumPadBot(this.x, this.y);
	}
}

const numPadBot = new NumPadBot();
const input = "379A";

function numpadWalk(str: string, i: number, prefix: string, numPadBot: NumPadBot, results: string[]): void {
	if (str.length <= i) {
		results.push(prefix);
		return;
	}
	for (const letters of numPadBot.nextStep(str[i] as NumButton)) {
		numpadWalk(str, i + 1, prefix + letters, numPadBot.clone(), results);
	}
}
const ArrowPadButtonPos: Record<Step, [number, number]> = {
	A: [2, 3],
	"^": [1, 3],
	"<": [0, 2],
	">": [1, 2],
	v: [2, 2],
};
const ArrowForbiddenX = 0;
const ArrowForbiddenY = 0;
// Maps every source pad button and target pad button to the corresponding series of button presses
const arrowPadSnippets: Record<Step, Record<Step, string>> = {
	A: {
		A: "A",
		"^": "<A",
		"<": "v<<A",
		">": "vA",
		v: "<vA",
	},
	"^": {
		A: ">A",
		"^": "A",
		"<": "v<A",
		">": "v>A",
		v: "vA",
	},
	"<": {
		A: ">>^A",
		"^": ">^A",
		"<": "A",
		">": ">>A",
		v: ">A",
	},
	">": {
		A: "^A",
		"^": "<^A",
		"<": "<<A",
		">": "A",
		v: "<A",
	},
	v: {
		A: ">^A",
		"^": "^A",
		"<": "<A",
		">": ">A",
		v: "A",
	},
};
let sum = 0n;
for await (const input of readFileLines(import.meta.dirname + "/input.txt")) {
	console.log(input);
	const numPadBot = new NumPadBot();
	const numpadSequences: string[] = [];
	numpadWalk(input, 0, "", numPadBot, numpadSequences);

	let currentSequences = numpadSequences;
	for (let i = 0; i < 20; ++i) {
		console.log(currentSequences[0].length);
		currentSequences = currentSequences.map((x) => arrowPadWalk(x));
	}
	const minLength = currentSequences.reduce((a, b) => Math.min(a, b.length), Number.MAX_SAFE_INTEGER);
	sum += BigInt(minLength * parseInt(input.replace(/\D/g, "")));
}
console.log(sum);

function arrowPadWalk(str: string): string {
	let ret = "";
	let lastBtn: Step = "A";
	for (let i = 0; i < str.length; ++i) {
		const currentBtn = str[i] as Step;
		ret = ret + arrowPadSnippets[lastBtn][currentBtn];
		lastBtn = currentBtn;
	}
	return ret;
}

function horizontalLine(from: number, to: number): string {
	return (to > from ? ">" : "<").repeat(Math.abs(to - from));
}

function verticalLine(from: number, to: number): string {
	return (to > from ? "v" : "^").repeat(Math.abs(to - from));
}

type NumButton = "A" | "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
type Step = "<" | ">" | "^" | "v" | "A";
