import { readWorld } from "../shared";

const { height, width, pointsPreFreq } = await readWorld(import.meta.dirname + "/../input.txt");

const antinodes = new Set<number>();

for (const freq of pointsPreFreq.keys()) {
	const points = pointsPreFreq.get(freq)!;
	const len = points.length;
	const worldLength = height * width;

	for (var i = 0; i < len - 1; i++) {
		for (var j = i + 1; j < len; j++) {
			const a = points[i];
			const b = points[j];

			const ax = a % width;
			const bx = b % width;

			const d = b - a;

			const antinode1 = a - d;
			const antinode2 = b + d;

			if (antinode1 >= 0 && antinode1 < worldLength) {
				const antinodeX = antinode1 % width;
				if (Math.abs(antinodeX - ax) === Math.abs(ax - bx)) {
					antinodes.add(antinode1);
				}
			}

			if (antinode2 >= 0 && antinode2 < worldLength) {
				const antinodeX = antinode2 % width;
				if (Math.abs(antinodeX - bx) === Math.abs(ax - bx)) {
					antinodes.add(antinode2);
				}
			}
		}
	}
}

console.log(antinodes.size);

function printDebugMap() {
	const map = new Array(height).fill(0).map((): string[] => new Array(width).fill("."));

	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const point = y * width + x;
			if (antinodes.has(point)) {
				map[y][x] = "#";
			}
		}
	}

	for (const freq of pointsPreFreq.keys()) {
		const points = pointsPreFreq.get(freq)!;
		for (const point of points) {
			const x = point % width;
			const y = Math.floor(point / width);
			map[y][x] = freq;
		}
	}

	console.log(map.map((row) => row.join("")).join("\n"));
}
