import { readFileLines } from "../shared";

/**
 * This is just a cute idea I had to move the entire work to the regex engine. Sadly, it's
 * extremely slow.
 */

const lineReader = readFileLines(import.meta.dirname + "/input.txt");

const regex = new RegExp("^(" + ((await lineReader.next()).value as string).replaceAll(", ", "|") + ")+$");
await lineReader.next(); // Skip empty line

let count = 0;
for await (const line of lineReader) {
	if (tryPatternRegex(line)) {
		count++;
	}
}
console.log(count);

function tryPatternRegex(pattern: string): boolean {
	return regex.test(pattern);
}
