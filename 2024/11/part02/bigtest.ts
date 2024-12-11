const firstLine = "6571 0 5851763 526746 23 69822 9 989";
const initialNums = firstLine.split(" ").map((x) => parseInt(x));

export function solve(): bigint {
	// A depth of 100 cannot be handled by the double variant. It will be in the right range, but
	// it's beyond the safe integer range and some precision will be lost.
	const depth = 100;
	const cache = new Array<bigint>((depth - 1) * 10).fill(0n);

	let length = 0n;

	for (const num of initialNums) {
		console.log(num);
		const a = countBigint(BigInt(num), depth, cache);
		length += a;
	}

	return length;
}

export function countBigint(num: bigint, depth: number, cache: Array<bigint>): bigint {
	if (depth === 0) return 1n;

	// The last depth for the numbers 0-9 don't need to be cached, they are always 1
	let cacheIndex = 0;
	if (num <= 9) {
		if (depth === 1) return 1n;

		cacheIndex = (depth - 2) * 10 + Number(num);
		if (cache[cacheIndex] !== 0n) {
			return cache[cacheIndex];
		}
	}
	let ret = 0n;
	if (num === 0n) {
		ret = countBigint(1n, depth - 1, cache);
	} else {
		const str = num.toString();
		if (str.length % 2 === 0) {
			if (depth === 1) return 2n;

			const left = BigInt(str.slice(0, str.length / 2));
			const right = BigInt(str.slice(str.length / 2));

			ret += countBigint(right, depth - 1, cache);
			ret += countBigint(left, depth - 1, cache);
		} else {
			ret = countBigint(num * 2024n, depth - 1, cache);
		}
	}
	if (ret === 0n) throw new Error("Invalid number");
	if (num <= 9) {
		cache[cacheIndex] = ret;
	}
	return ret;
}

console.log(solve());

// 3612059467755
// 242090118578155
