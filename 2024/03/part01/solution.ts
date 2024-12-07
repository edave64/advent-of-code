import { openFile } from "../../shared";

const fulltext = await (await openFile(import.meta.dirname + "/../input.txt")).readFile({ encoding: "utf8" });

let sum = 0;

for (const [f, a, b] of fulltext.matchAll(/mul\((\d{1,3}),(\d{1,3})\)/g)) {
	sum += parseInt(a) * parseInt(b);
}

console.log(sum);
