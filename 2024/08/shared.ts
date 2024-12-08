import { readFileLines } from "../shared";

export async function readWorld(filename: string): Promise<{
	height: number;
	width: number;
	pointsPreFreq: Map<string, number[]>;
}> {
	let width = 0;
	let height = 0;

	// This array was originally a set, but later on we do a lot more lookups by index, and the way we
	// fill it already pretty much guarantees that it's unique.
	const pointsPreFreq = new Map<string, number[]>();

	for await (const line of readFileLines(filename)) {
		if (width === 0) {
			width = line.length;
		} else if (line.length !== width) {
			throw new Error(`Inconsistent line length at ${height}`);
		}

		for (let x = 0; x < line.length; x++) {
			const char = line[x];
			if (char === ".") continue;
			let pointSet = pointsPreFreq.get(char);
			if (pointSet === undefined) {
				pointSet = [];
				pointsPreFreq.set(char, pointSet);
			}
			// Note down our current index
			pointSet.push(height * width + x);
		}

		height++;
	}

	return { height, width, pointsPreFreq };
}

export function printDebugMap(
	width: number,
	height: number,
	pointsPreFreq: Map<string, number[]>,
	antinodes: Set<number>,
) {
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
