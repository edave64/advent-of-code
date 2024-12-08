import { readFileLines } from "../../shared";

// Attempt to implement https://sfba.social/@papajohn/113613703927416111
// I didn't look at their code, just the idea.

let sum = 0;

for await (const line of readFileLines(import.meta.dirname + "/../input.txt")) {
	const [testStr, values] = line.split(":");
	const test = Number(testStr);
	const inputs = values.trim().split(" ").map(Number);

	if (findBackward(test, inputs, inputs.length - 1)) {
		sum += test;
	}
}

console.log(sum);

function findBackward(target: number, input: number[], idx: number): boolean {
	if (target < 0) return false;
	const head = input[idx];
	// At the end, our remaining number should be the same as the first number
	if (idx <= 0) return head === target;
	if (findBackward(target - head, input, idx - 1)) return true;
	// Since addition and multiplication of integers can only result in integers, we can trim this
	// branch if division would not result in an integer
	if (target % head === 0 && findBackward(target / head, input, idx - 1)) return true;
	const deConcat = (target - head) / Math.pow(10, Math.floor(Math.log10(head) + 1));
	// We only need to check the inverse concat branch if the the our number starts with the head
	if (deConcat % 1 === 0 && findBackward(deConcat, input, idx - 1)) return true;

	return false;
}
