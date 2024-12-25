import { readFileLines } from "../shared";
import { Step } from "./shared.ts";
import { numpadWalk } from "./numPad.ts";
import { arrowPadSnippets } from "./arrowPad.ts";

const cache = new Map<string, bigint>();

let sum = 0n;
for await (const input of readFileLines(import.meta.dirname + "/input.txt")) {
	const lengths: bigint[] = [];
	for (const baseSequence of numpadWalk(input)) {
		let length = arrowPadWalkCached(baseSequence, 25);
		lengths.push(length);
	}
	const minLength = lengths.reduce((a, b) => (a < b ? a : b));
	sum += minLength * BigInt(parseInt(input.replace(/\D/g, "")));
}
console.log(sum);

function arrowPadWalkCached(source: string, layer: number): bigint {
	if (layer === 0) return BigInt(source.length);
	// Since all robots return to A for every press, pressing A at any level always just requires the top level to press A
	if (source === "A") return 1n;
	const cacheKey = source + "_" + layer;
	const cached = cache.get(cacheKey);
	if (cached !== undefined) return cached;
	let lastBtn: Step = "A";
	let ret = 0n;
	for (const currentBtn of source as Iterable<Step>) {
		ret += arrowPadSnippets[lastBtn][currentBtn]
			.map((seq) => arrowPadWalkCached(seq, layer - 1))
			.reduce((a, b) => (a < b ? a : b));
		lastBtn = currentBtn;
	}
	cache.set(cacheKey, ret);
	return ret;
}
