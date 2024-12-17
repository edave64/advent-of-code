import { readFileLines } from "../shared";
import { dirCosts, Direction, dirs, parseMap, printDbg, Tile } from "./shared";

const lines = await Array.fromAsync(readFileLines(import.meta.dirname + "/input.txt"));
const { map, width, height, deltas, startIdx, endIdx } = parseMap(lines);

const startPoints = new Map<number, Direction>();
startPoints.set(startIdx, Direction.East);

if (map[startIdx + deltas[Direction.East]] === Tile.Wall && map[startIdx + deltas[Direction.West]] === Tile.Empty) {
	// If the first would run us directly into the wall, that is the only step where it would be valid to do a 180° turn.
	const behindIdx = startIdx + deltas[Direction.West];
	map[behindIdx] = 2001;
	startPoints.set(behindIdx, Direction.West);
}

/**
 * Part 1, we do a breadth-first search from the start point with the lowest current value. We walk
 * in a straight line from there until we hit a wall. Any neighboring tile along the way is added
 * to the list of starting points.
 * Eventually, we hit the end point, and we print the final value.
 */

while (startPoints.size > 0 /*&& map[endIdx] === Tile.Empty*/) {
	let startPoint = -1;
	let startPointCost = Infinity;
	let direction = Direction.North;
	for (const [idx, dir] of startPoints) {
		const pointCost = map[idx];
		if (pointCost < startPointCost) {
			startPoint = idx;
			startPointCost = pointCost;
			direction = dir;
		}
	}
	startPoints.delete(startPoint);
	const delta = deltas[direction];
	let value = startPointCost;
	for (let i = startPoint; ; i += delta) {
		const tile = map[i];
		if (tile === Tile.Wall) {
			break;
		}

		if (tile === Tile.Empty || tile >= value) {
			let preforkValue = value;
			if (i !== endIdx && map[i + delta] === Tile.Wall) {
				// When we hit the wall, the field forces a turn. So we add the 1000 points turn
				// penalty here. This is important for the later backtracking.
				preforkValue += 1000;
			}
			if (tile === Tile.Empty || tile >= preforkValue) {
				map[i] = preforkValue;
			}
		} else {
			// The tile in question was already visited at a lower cost
			break;
		}
		if (i === endIdx) break;
		let neighbor1: number;
		let neighbor1Dir: Direction;
		let neighbor2: number;
		let neighbor2Dir: Direction;
		switch (direction) {
			case Direction.North:
			case Direction.South:
				neighbor1Dir = Direction.East;
				neighbor1 = i - 1;
				neighbor2Dir = Direction.West;
				neighbor2 = i + 1;
				break;
			default:
				neighbor1Dir = Direction.North;
				neighbor1 = i - width;
				neighbor2Dir = Direction.South;
				neighbor2 = i + width;
				break;
		}
		const neighborValue = value + 1001;
		const neighbor1Tile = map[neighbor1];
		if (neighbor1 !== Tile.Wall && (neighbor1Tile === Tile.Empty || neighbor1Tile > neighborValue)) {
			map[neighbor1] = neighborValue;
			startPoints.set(neighbor1, neighbor1Dir);
		}
		const neighbor2Tile = map[neighbor2];
		if (neighbor2 !== Tile.Wall && (neighbor2Tile === Tile.Empty || neighbor2Tile > neighborValue)) {
			map[neighbor2] = neighborValue;
			startPoints.set(neighbor2, neighbor2Dir);
		}
		value += 1;
	}
}

// Our scores start at 1, so we need to subtract 1 from the final value
console.log(`part1: ${map[endIdx] - 1}`);

const part2Map = new Uint32Array(map.length).fill(Tile.Empty);
const ret = walkStupid(startIdx, 0, Direction.East, new Set());
console.log(`part2: ${ret!.size}`);
printDbg(map, width, height, ret!);

/**
 * Currently, part 1 seems to have a bug. There is an entire second path in the input that it doesn't find.
 * It still finds the right answer for part 1, but since this solution depends on part 1 to find all the possible paths
 * back from the end point, it doesn't give the right answer for part 2.
 * */
function walkBackwards(idx: number, visited: Set<number>): void {
	const tile = map[idx];
	visited.add(idx);
	for (const dir of dirs) {
		const newIdx = idx + deltas[dir];
		const newTile = map[newIdx];
		if (newTile !== Tile.Empty && newTile !== Tile.Wall && newTile < tile) {
			walkBackwards(newIdx, visited);
		}
	}
}

function walkStupid(idx: number, val: number, lastDir: Direction, visited: Set<number>): Set<number> | null {
	if (map[idx] === Tile.Wall) return null;
	if (visited.has(idx)) return null;
	if (val > map[endIdx]) return null;
	if (part2Map[idx] !== Tile.Empty && val > part2Map[idx] + 1000) return null;
	if (idx === endIdx) {
		const ret = new Set<number>();
		ret.add(idx);
		return ret;
	}
	part2Map[idx] = val;
	visited.add(idx);
	const tile = map[idx];
	let ret: Set<number> | null = null;
	for (const dir of dirs) {
		const newIdx = idx + deltas[dir];
		const subRet = walkStupid(newIdx, val + dirCosts[lastDir][dir], dir, visited);
		if (subRet !== null) {
			ret = ret ? ret.union(subRet) : subRet;
		}
	}
	visited.delete(idx);
	if (ret !== null) {
		ret.add(idx);
	}
	return ret;
}
