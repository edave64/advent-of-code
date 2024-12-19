import { readFileLines } from "../shared";
import { readPatternMap } from "./share";

const lineReader = readFileLines(import.meta.dirname + "/input.txt");
const patterns = readPatternMap((await lineReader.next()).value);

await lineReader.next(); // Skip empty line

let count = 0;
for await (const line of lineReader) {
	if (tryPattern(line)) {
		count++;
	}
}
console.log(count);

function tryPattern(pattern: string): boolean {
	const cache: Array<boolean | null> = new Array(pattern.length).fill(null);
	return rec(0);

	function rec(idx: number): boolean {
		if (pattern.length === idx) {
			return true;
		}
		if (cache[idx] !== null) {
			return cache[idx];
		}
		// Every rec call will work with indices higher than the current one, so there is no danger
		// of this confusing them.
		cache[idx] = false;
		const patternList = patterns.get(pattern[idx]);
		if (patternList === undefined) {
			return false;
		}
		for (const p of patternList) {
			if (pattern.startsWith(p, idx)) {
				if (rec(idx + p.length)) {
					cache[idx] = true;
					return true;
				}
			}
		}
		return false;
	}
}
