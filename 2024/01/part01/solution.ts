import { promises as fs } from "fs";

let file: fs.FileHandle;
try {
	file = await fs.open(import.meta.dirname + "/../input", "r");
} catch (e) {
	console.error("No input file found");
	console.error(e);
	process.exit(1);
}

const leftList: number[] = [];
const rightList: number[] = [];

for await (const line of file.readLines()) {
	const [left, right] = line.split(/ +/).map((x: string) => parseInt(x));

	leftList.push(left);
	rightList.push(right);
}

// The task says to always compare the smallest value on the left to the smallest value on the
// right, then the second smallest value on the left to the second smallest value on the right.
//
// If we sort the lists, we should just be able to linearly walk through the two lists.
leftList.sort((a, b) => a - b);
rightList.sort((a, b) => a - b);

const len = Math.min(leftList.length, rightList.length);

let sum = 0;

for (let i = 0; i < len; i++) {
	const distance = Math.abs(leftList[i] - rightList[i]);
	sum += distance;
}

console.log(sum);
