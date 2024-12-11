const firstLine = "6571 0 5851763 526746 23 69822 9 989";
const initialNums = firstLine.split(" ").map((x) => parseInt(x));

export function solve(): number {
	const depth = 25;
	const cache = new Uint32Array((depth - 1) * 10);

	let length = 0;

	for (const num of initialNums) {
		length += countDouble(num, depth, cache);
	}

	return length;
}

export function countDouble(num: number, depth: number, cache: Uint32Array | Array<number>): number {
	if (depth === 0) return 1;

	// The last depth for the numbers 0-9 don't need to be cached, they are always 1
	let cacheIndex = 0;
	if (num <= 9) {
		if (depth === 1) return 1;

		cacheIndex = (depth - 2) * 10 + num;
		if (cache[cacheIndex] !== 0) {
			return cache[cacheIndex];
		}
	}
	let ret = 0;
	if (num === 0) {
		ret = countDouble(1, depth - 1, cache);
	} else {
		const nrOfDigits = Math.floor(Math.log10(num) + 1);
		if (nrOfDigits % 2 === 0) {
			if (depth === 1) return 2;

			const half = Math.pow(10, nrOfDigits / 2);
			const right = num % half;
			const left = Math.floor(num / half);

			ret += countDouble(right, depth - 1, cache);
			ret += countDouble(left, depth - 1, cache);
		} else {
			ret = countDouble(num * 2024, depth - 1, cache);
		}
	}
	if (ret === 0) throw new Error("Invalid number");
	if (num <= 9) {
		cache[cacheIndex] = ret;
	}
	return ret;
}

if (import.meta.main) {
	console.log(solve());
}
