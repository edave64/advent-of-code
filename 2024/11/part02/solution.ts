import { countDouble } from "../part01/solution";

const firstLine = "6571 0 5851763 526746 23 69822 9 989";
const initialNums = firstLine.split(" ").map((x) => parseInt(x));

export function solve(): number {
	const depth = 75;
	// Here our cache needs to contain numbers larger than u32 can hold. So we use an array which
	// will be filled with JS numbers (doubles)
	const cache = new Array((depth - 1) * 10).fill(0);

	let length = 0;

	for (const num of initialNums) {
		length += countDouble(num, depth, cache);
	}

	return length;
}

if (import.meta.main) {
	console.log(solve());
}
