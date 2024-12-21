import { MaxU32bit, readFileLines } from "../shared";

export enum Tile {
	Obstacle,
	Empty,
}

export function readData(
	filename: string,
	getNextObstacles: false,
): Promise<{
	map: Uint8Array;
	width: number;
	height: number;
}>;
export function readData(
	filename: string,
	getNextObstacles: true,
): Promise<{
	map: Uint8Array;
	width: number;
	height: number;
	nextObstacles: number[];
}>;
export async function readData(
	filename: string,
	getNextObstacles: boolean,
): Promise<{
	map: Uint8Array;
	width: number;
	height: number;
	nextObstacles?: number[];
}> {
	let map: Uint8Array = null!;
	let part1ObstacleCount = 0;
	let width = 0;
	let height = 0;

	const nextObstacles: number[] | undefined = getNextObstacles ? [] : undefined;

	for await (const line of readFileLines(filename)) {
		if (!map) {
			const [w, h, c] = line
				.match(/(\d+)x(\d+),(\d+)/)!
				.slice(1)
				.map(Number);
			width = w;
			height = h;
			part1ObstacleCount = c;
			map = new Uint8Array(width * height).fill(Tile.Empty);
		} else {
			const [x, y] = line.split(",").map(Number);
			if (part1ObstacleCount > 0) {
				map[y * width + x] = Tile.Obstacle;
				// Even in part 2, we know that part 1 is solvable, so we can just drop the obstacles
				part1ObstacleCount--;
			} else if (nextObstacles) {
				nextObstacles.push(y * width + x);
			}
		}
	}

	return {
		map,
		width,
		height,
		nextObstacles,
	};
}

// Adapted from wikipedia: https://en.wikipedia.org/w/index.php?title=A*_search_algorithm&oldid=1259730047
export function aStar(start: number, goal: number, map: Uint8Array, width: number): number[] | null {
	let openSet = new Set<number>([start]);

	let cameFrom = new Uint32Array(map.length).fill(0);
	let stepsToReach = new Uint32Array(map.length).fill(MaxU32bit);
	stepsToReach[start] = 0;

	// The score of a node is the number of steps to reach the node plus the distance to the goal
	let score = new Uint32Array(map.length).fill(MaxU32bit);
	score[start] = distance(start, goal, width);

	while (openSet.size > 0) {
		const current = openSet.values().reduce((acc, x) => (score[acc]! < score[x]! ? acc : x));
		if (current === goal) {
			return reconstructPath(cameFrom, current);
		}
		openSet.delete(current);
		for (const neighbor of neighbors(current, width, map.length)) {
			if (map[neighbor] === Tile.Obstacle) {
				continue;
			}
			const tentative_gScore = stepsToReach[current] + 1;
			if (tentative_gScore < stepsToReach[neighbor]) {
				cameFrom[neighbor] = current;
				stepsToReach[neighbor] = tentative_gScore;
				score[neighbor] = tentative_gScore + distance(neighbor, goal, width);
				if (!openSet.has(neighbor)) {
					openSet.add(neighbor);
				}
			}
		}
	}
	// Open set is empty but goal was never reached
	return null;
}

function reconstructPath(cameFrom: Uint32Array, current: number): number[] {
	let totalPath = [];
	let idx: number | undefined = current;
	while (idx !== undefined) {
		totalPath.unshift(idx);
		if (idx === 0) break;
		idx = cameFrom[idx];
	}
	return totalPath;
}

// Manhattan distance between two points
function distance(from: number, to: number, width: number): number {
	const fromX = from % width;
	const toX = to % width;
	const fromY = Math.floor(from / width);
	const toY = Math.floor(to / width);
	return Math.abs(fromX - toX) + Math.abs(fromY - toY);
}

function* neighbors(idx: number, width: number, max: number): Generator<number> {
	const x = idx % width;

	if (x > 0) {
		yield idx - 1;
	}
	if (x < width - 1) {
		yield idx + 1;
	}
	if (idx > width) {
		yield idx - width;
	}
	if (idx < max - width) {
		yield idx + width;
	}
}

export function debugPrint(map: Uint8Array, width: number, path: number[]) {
	for (let y = 0; y < map.length / width; y++) {
		let line = "";
		for (let x = 0; x < width; x++) {
			const idx = y * width + x;
			if (map[idx] === Tile.Obstacle) {
				line += "#";
			} else {
				const pathIdx = path.findIndex((p) => p === idx);
				if (pathIdx !== -1) {
					line += "0";
				} else {
					line += ".";
				}
			}
		}
		console.log(line);
	}
}
