import { readFileLines } from "../../shared";

let sum = 0;

for await (const line of readFileLines(import.meta.dirname + "/../input.txt")) {
	const [testStr, values] = line.split(":");
	const test = Number(testStr);
	const inputs = values.trim().split(" ").map(Number);

	if (find(test, inputs, 1, inputs[0])) {
		sum += test;
	}
}

console.log(sum);

function find(target: number, input: number[], idx: number, acc: number): boolean {
	if (acc > target) return false;
	if (input.length === idx) return acc === target;
	const head = input[idx];
	if (find(target, input, idx + 1, acc + head)) return true;
	if (find(target, input, idx + 1, acc * head)) return true;
	return false;
}
