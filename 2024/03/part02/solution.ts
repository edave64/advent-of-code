import { promises as fs } from "fs";

let file: fs.FileHandle;
try {
    file = await fs.open(import.meta.dirname + "/../input.txt", "r");
} catch (e) {
    console.error("No input file found");
    console.error(e);
    process.exit(1);
}

const fulltext = await file.readFile({ encoding: "utf8" });

let sum = 0;
let enabled = true;

for (const [f, a, b] of fulltext.matchAll(/mul\((\d{1,3}),(\d{1,3})\)|do\(\)|don't\(\)/g)) {
    if (f === "do()") {
        enabled = true;
    } else if (f === "don't()") {
        enabled = false;
    } else if (enabled) {
        sum += parseInt(a) * parseInt(b);
    }
}

console.log(sum);
