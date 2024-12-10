import { readWorld } from "../../shared";

const { width, map } = await readWorld(import.meta.dirname + "/../input.txt");

let sum = 0;

for (let idx = 0; idx < map.length; idx++) {
	if (map[idx] === 0) {
		const found = new Set<number>();
		walk(idx, 1, found);
		sum += found.size;
	}
}

console.log(sum);

// Max depth is 10, so no overflow worries
function walk(idx: number, dir: number, found: Set<number>) {
	const value = map[idx];
	if (value === 9) {
		found.add(idx);
		return;
	}
	const x = idx % width;
	const next = value + dir;
	// Check left
	if (x > 0 && map[idx - 1] === next) {
		walk(idx - 1, dir, found);
	}
	// Check right
	if (x < width - 1 && map[idx + 1] === next) {
		walk(idx + 1, dir, found);
	}
	// Check up
	if (map[idx - width] === next) {
		walk(idx - width, dir, found);
	}
	// Check down
	if (map[idx + width] === next) {
		walk(idx + width, dir, found);
	}
}
