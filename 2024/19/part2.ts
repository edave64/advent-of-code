import { readFileLines } from "../shared";
import { readPatternMap } from "./share";

const lineReader = readFileLines(import.meta.dirname + "/input.txt");
const patterns = readPatternMap((await lineReader.next()).value);

await lineReader.next(); // Skip empty line

let sum = 0n;
for await (const line of readFileLines(import.meta.dirname + "/input.txt")) {
	sum += tryLookupMap(line);
}
console.log(sum);

function tryLookupMap(target: string): bigint {
	const matches: number[][] = new Array(target.length).fill(0).map((x) => []);
	const cache: bigint[] = new Array(target.length).fill(null);
	for (let i = 0; i < target.length; i++) {
		const localPatterns = patterns.get(target[i]);
		if (localPatterns) {
			for (const pattern of localPatterns) {
				if (target.startsWith(pattern, i)) {
					matches[i].push(pattern.length);
				}
			}
		}
	}
	return recSearch(0);

	function recSearch(idx: number): bigint {
		if (idx === target.length) {
			return 1n;
		}
		if (cache[idx] !== null) {
			return cache[idx];
		}
		let sum = 0n;
		for (const match of matches[idx]) {
			sum += recSearch(idx + match);
		}
		cache[idx] = sum;
		return sum;
	}
}
