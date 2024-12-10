import { readWorld } from "../../shared";

const { width, map } = await readWorld(import.meta.dirname + "/../input.txt");

export function solve(): number {
	const targetMap = new Uint8Array(map.length).fill(1);

	// This solution iterates 9 times over the `map`, filling in the `targetMap`. First it finds all
	// fields of value 8 in `map` and adds up, for every neighbors that has the value 9 in `map`, the
	// values in `targetMap` at the same index.
	// Next fields of value 7 add up their value 8 neighbors, and so on.
	// In the end, the fields of value 0 contain the ratings of the trailheads.

	// I think this could run really well on a GPU, since within one iteration, each field of the map
	// is independent of the others. The iterations themselves would have to run in order though.

	for (let val = 8; val >= 0; --val) {
		const neighborVal = val + 1;
		for (let idx = 0; idx < map.length; ++idx) {
			if (map[idx] !== val) continue;

			const x = idx % width;

			let targetVal = 0;
			// Check left
			if (x > 0 && map[idx - 1] === neighborVal) {
				targetVal += targetMap[idx - 1];
			}
			// Check right
			if (x < width - 1 && map[idx + 1] === neighborVal) {
				targetVal += targetMap[idx + 1];
			}
			// Check up
			if (map[idx - width] === neighborVal) {
				targetVal += targetMap[idx - width];
			}
			// Check down
			if (map[idx + width] === neighborVal) {
				targetVal += targetMap[idx + width];
			}
			targetMap[idx] = targetVal;
		}
	}

	let sum = 0;

	for (let idx = 0; idx < map.length; ++idx) {
		if (map[idx] === 0) {
			sum += targetMap[idx];
		}
	}
	return sum;
}

if (import.meta.main) {
	console.log(solve());
}
