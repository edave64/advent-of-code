import { readFileLines } from "../shared";
import { NumButton, Step } from "./shared.ts";
import { NumPadBot } from "./numPad.ts";
import { arrowPadSnippets } from "./arrowPad.ts";

function numpadWalk(str: string, i: number, prefix: string, numPadBot: NumPadBot, results: string[]): void {
	if (str.length <= i) {
		results.push(prefix);
		return;
	}
	for (const letters of numPadBot.nextStep(str[i] as NumButton)) {
		numpadWalk(str, i + 1, prefix + letters, numPadBot.clone(), results);
	}
}

const cache = new Map<string, bigint>();
const usedCombos = new Set<string>();

let sum = 0n;
for await (const input of readFileLines(import.meta.dirname + "/input.txt")) {
	console.log(input);
	const numPadBot = new NumPadBot();
	const numpadSequences: string[] = [];
	numpadWalk(input, 0, "", numPadBot, numpadSequences);

	const lengths: bigint[] = [];
	for (const baseSequence of numpadSequences) {
		let length = arrowPadWalkCached(baseSequence, 5);
		console.log(length);
		lengths.push(length);
	}
	console.log(lengths);
	const minLength = lengths.reduce((a, b) => (a < b ? a : b));
	sum += minLength * BigInt(parseInt(input.replace(/\D/g, "")));
}
console.log(sum);
console.log(usedCombos.size);

function arrowPadWalkCached(source: string, layer: number): bigint {
	if (layer === 0) return BigInt(source.length);
	const cacheKey = layer + source;
	const cached = cache.get(cacheKey);
	if (cached !== undefined) return cached;
	let lastBtn: Step = "A";
	let ret = 0n;
	for (const currentBtn of source as Iterable<Step>) {
		usedCombos.add(lastBtn + "_" + currentBtn);
		ret += arrowPadWalkCached(arrowPadSnippets[lastBtn][currentBtn], layer - 1);
		lastBtn = currentBtn;
	}
	cache.set(cacheKey, ret);
	return ret;
}
