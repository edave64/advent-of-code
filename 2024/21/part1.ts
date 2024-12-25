import { readFileLines } from "../shared";
import { numpadWalk } from "./numPad.ts";
import { arrowPadSnippets } from "./arrowPad.ts";
import { Step } from "./shared.ts";

let sum = 0;
for await (const input of readFileLines(import.meta.dirname + "/input.txt")) {
	const bot1 = numpadWalk(input).flatMap((x) => arrowPadWalk(x));
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
		// In part 1, the alternative moves don't matter. This bit me originally, because I optimized these choices away,
		// thinking it didn't matter.
		ret = ret.map((x) => arrowPadSnippets[lastBtn][currentBtn][0] + x);
		lastBtn = currentBtn;
	}
	return ret;
}
