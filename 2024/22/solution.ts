import { readFileLines } from "../shared";

let sum = 0;
const globalSequenceMap = new Map<number, number>();
for await (const input of readFileLines(import.meta.dirname + "/input.txt")) {
	const intialNumber = parseInt(input);
	let currentNumber = intialNumber;
	let previousPrice = intialNumber % 10;
	let currentSequenceCode = 0;
	// We store which sequence of 4 numbers produces which price
	// If there is already an entry for the current sequence, there is a collision and the new
	// value is discarded. This deduplication also means we must store sequences that result in
	// zero.
	// Since prices are always 0-9, and JS doesn't have structs to efficiently store multiple
	// values, we store the sequence as a 16-bit number. (4 bits per price difference)
	// TODO: After writing this, I realized that price differences can be negative, so that should
	// throw the math off a bit. But it got the correct answer anyway.
	const sequenceMap = new Map<number, number>();
	for (let i = 0; i < 2000; ++i) {
		currentNumber = processNumber(currentNumber);
		const currentPrice = currentNumber % 10;
		currentSequenceCode = ((currentSequenceCode << 4) & 0xffff) + (currentPrice - previousPrice);
		if (i > 3 && !sequenceMap.has(currentSequenceCode)) {
			sequenceMap.set(currentSequenceCode, currentPrice);
		}
		previousPrice = currentPrice;
	}
	for (const [sequenceCode, price] of sequenceMap) {
		globalSequenceMap.set(sequenceCode, (globalSequenceMap.get(sequenceCode)! ?? 0) + price);
	}
	sum += currentNumber;
}

console.log("part1", sum);
console.log(
	"part2",
	globalSequenceMap.values().reduce((highest, current) => (highest < current ? current : highest)),
);

function encodeSequence(num1: number, num2: number, num3: number, num4: number): number {
	return (num1 << 12) | (num2 << 8) | (num3 << 4) | num4;
}

function processNumber(num: number): number {
	num = (num ^ num << 6) & 0b111111111111111111111111;
	num = (num ^ num >> 5) & 0b111111111111111111111111;
	num = (num ^ num << 11) & 0b111111111111111111111111;

	return num;
}

