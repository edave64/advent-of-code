import { bench, run } from "mitata";
import { readWorld } from "../../shared";

const { width, map } = await readWorld(import.meta.dirname + "/../input.txt");

export function solve(): number {
	let sum = 0;

	for (let idx = 0; idx < map.length; idx++) {
		if (map[idx] === 0) {
			sum += walk(idx, 1);
		}
	}

	return sum;
}

// Max depth is 10, so no overflow worries
function walk(idx: number, dir: number): number {
	const value = map[idx];
	if (value === 9) {
		return 1;
	}
	const x = idx % width;
	const next = value + dir;
	let rating = 0;
	// Check left
	if (x > 0 && map[idx - 1] === next) {
		rating += walk(idx - 1, dir);
	}
	// Check right
	if (x < width - 1 && map[idx + 1] === next) {
		rating += walk(idx + 1, dir);
	}
	// Check up
	if (map[idx - width] === next) {
		rating += walk(idx - width, dir);
	}
	// Check down
	if (map[idx + width] === next) {
		rating += walk(idx + width, dir);
	}
	return rating;
}

if (import.meta.main) {
	console.log(solve());
}
