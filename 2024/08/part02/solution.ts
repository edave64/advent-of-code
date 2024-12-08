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

			// Antenna's are now also antinodes
			antinodes.add(a);
			antinodes.add(b);

			const ax = a % width;
			const bx = b % width;
			const dx = Math.abs(ax - bx);

			const d = b - a;

			let antinode = a;
			let lastAntinodeX = ax;
			while (true) {
				antinode -= d;
				if (antinode >= 0) {
					const antinodeX = antinode % width;
					if (Math.abs(antinodeX - lastAntinodeX) === dx) {
						antinodes.add(antinode);
					} else break;
					lastAntinodeX = antinodeX;
				} else break;
			}

			antinode = b;
			lastAntinodeX = bx;
			while (true) {
				antinode += d;
				if (antinode < worldLength) {
					const antinodeX = antinode % width;
					if (Math.abs(antinodeX - lastAntinodeX) === dx) {
						antinodes.add(antinode);
					} else break;
					lastAntinodeX = antinodeX;
				} else break;
			}
		}
	}
}

console.log(antinodes.size);
