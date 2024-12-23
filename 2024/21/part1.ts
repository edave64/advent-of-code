import { readFileLines } from "../shared";
import { playSequence } from "./player";
import { NumPadBot } from "./numPad.ts";
import { arrowPadSnippets } from "./arrowPad.ts";
import { NumButton, Step } from "./shared.ts";

function numpadWalk(str: string, i: number, prefix: string, numPadBot: NumPadBot, results: string[]): void {
	if (str.length <= i) {
		results.push(prefix);
		return;
	}
	for (const letters of numPadBot.nextStep(str[i] as NumButton)) {
		numpadWalk(str, i + 1, prefix + letters, numPadBot.clone(), results);
	}
}
let sum = 0;
for await (const input of readFileLines(import.meta.dirname + "/input.txt")) {
	const numPadBot = new NumPadBot();
	const numpadSequences: string[] = [];
	numpadWalk(input, 0, "", numPadBot, numpadSequences);
	const bot1 = numpadSequences.flatMap((x) => arrowPadWalk(x));
	const bot2 = bot1.flatMap((x) => arrowPadWalk(x));
	const minLength = bot2.reduce((a, b) => Math.min(a, b.length), Number.MAX_SAFE_INTEGER);
	sum += minLength * parseInt(input.replace(/\D/g, ""));
}
console.log(sum);

function arrowPadWalk(str: string): string[] {
	let ret: string[] = [""];
	let lastBtn: Step = "A";
	for (let i = 0; i < str.length; ++i) {
		const currentBtn = str[i] as Step;
		ret = ret.map((x) => arrowPadSnippets[lastBtn][currentBtn] + x);
		lastBtn = currentBtn;
	}
	return ret;
}
