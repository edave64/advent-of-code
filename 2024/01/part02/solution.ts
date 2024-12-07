import { readFileLines } from "../../shared";

const leftList = new Map<number, number>();
const rightList = new Map<number, number>();

for await (const line of readFileLines(import.meta.dirname + "/../input")) {
	const [left, right] = line.split(/ +/).map((x: string) => parseInt(x));
	leftList.set(left, (leftList.get(left) ?? 0) + 1);
	rightList.set(right, (rightList.get(right) ?? 0) + 1);
}

// The second part says to multiply each number in the left list by the number of times it appears
// in the right list, and then sum the results.
// Since the same number appearing multiple times in the left list will add the same number to sum
// every time, we can just multiply by the number of times it appears in that list, too and use
// counter maps for both lists.

let sum = 0;

for (const key of leftList.keys()) {
	const similarity = key * leftList.get(key)! * (rightList.get(key) ?? 0);
	sum += similarity;
}

console.log(sum);
