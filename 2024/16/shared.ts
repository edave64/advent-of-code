export enum Tile {
	Wall = 0,
	Empty = 1,
}

export enum Direction {
	North = 0,
	West = 1,
	South = 2,
	East = 3,
}

export function parseMap(lines: string[]): {
	map: Uint32Array;
	width: number;
	height: number;
	deltas: Record<Direction, number>;
	startIdx: number;
	endIdx: number;
} {
	const height = lines.length;
	const width = lines[0].length;
	const map = new Uint32Array(height * width).fill(Tile.Empty);
	let startIdx = 0;
	let endIdx = 0;
	const startPoints = new Map<number, Direction>();

	for (let y = 0; y < height; y++) {
		const line = lines[y];
		for (let x = 0; x < width; x++) {
			const tile = line[x];
			if (tile === "#") {
				map[y * width + x] = Tile.Wall;
			} else if (tile === ".") {
				map[y * width + x] = Tile.Empty;
			} else if (tile === "S") {
				startIdx = y * width + x;
				startPoints.set(startIdx, Direction.East);
			} else if (tile === "E") {
				endIdx = y * width + x;
			} else {
				throw new Error("Invalid tile: " + tile);
			}
		}
	}

	const deltas = {
		[Direction.North]: -width,
		[Direction.West]: 1,
		[Direction.South]: width,
		[Direction.East]: -1,
	};

	return { map, width, height, deltas, startIdx, endIdx };
}

export const dirs = [Direction.East, Direction.North, Direction.South, Direction.West];

export const dirCosts: Record<Direction, Record<Direction, number>> = {
	[Direction.North]: {
		[Direction.North]: 1,
		[Direction.East]: 1001,
		[Direction.South]: 2001,
		[Direction.West]: 1001,
	},
	[Direction.East]: {
		[Direction.North]: 1001,
		[Direction.East]: 1,
		[Direction.South]: 1001,
		[Direction.West]: 2001,
	},
	[Direction.South]: {
		[Direction.North]: 2001,
		[Direction.East]: 1001,
		[Direction.South]: 1,
		[Direction.West]: 1001,
	},
	[Direction.West]: {
		[Direction.North]: 1001,
		[Direction.East]: 2001,
		[Direction.South]: 1001,
		[Direction.West]: 1,
	},
};

export function printDbg(map: Uint32Array, width: number, height: number, visited: Set<number>) {
	const lines: string[] = [];
	for (let y = 0; y < height; y++) {
		let line = "";
		for (let x = 0; x < width; x++) {
			const tile = map[y * width + x];
			line += tile === Tile.Wall ? "#" : tile === Tile.Empty ? " " : visited.has(y * width + x) ? "O" : "+";
		}
		lines.push(line);
	}
	console.log(lines.join("\n"));
}

export function printValues(map: Uint32Array, height: number, width: number) {
	const max = map.reduce((a, b) => Math.max(a, b));
	const places = Math.floor(Math.log10(max) + 1);
	const lines: string[] = [];
	for (let y = 0; y < height; y++) {
		let line = "";
		for (let x = 0; x < width; x++) {
			const tile = map[y * width + x];
			if (tile === Tile.Empty) {
				line += "".padEnd(places, " ");
			} else if (tile === Tile.Wall) {
				line += "".padEnd(places, ".");
			} else {
				line += ("" + tile).padStart(places, "0");
			}
		}
		lines.push(line);
	}
	console.log(lines.join("\n"));
}
