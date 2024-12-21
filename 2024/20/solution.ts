/**
 * Basic concept: To calculate how much a shortcut would save, we first collect how close every
 * singe field is to start tile and to the end tile. For every field on the best base path, the sum
 * of these values is always equals to the minimal distance from the start to the end.
 *
 * So to find shortcuts, seek the regularly best path, and check for each tile on it if could reach
 * another tile where the start tiles distance from the start + the target tiles distance to the
 * end (+ the distance needed for the skip) is lower than the regular best value.
 */

// It just so happens we can reuse this
import { parseMap, Tile } from "../16/shared";
import { MaxU32bit, readFileLines } from "../shared";

const lines = await Array.fromAsync(readFileLines(import.meta.dirname + "/input.txt"));

const { map, height, width, startIdx, endIdx } = parseMap(lines);

const startToFinish = makeSeekMap(startIdx, endIdx);
const finishToStart = makeSeekMap(endIdx, startIdx);
const bestPath = bestPathTiles(startToFinish);

const bestValue = startToFinish[endIdx];
const minimumSave = 100;
const target = bestValue - minimumSave;

console.log("Part 1:" + solvePart(2));
console.log("Part 2:" + solvePart(20));

function solvePart(cheatDistance: number): number {
	let counter = 0;
	for (const idx of bestPath) {
		for (const neighbor of cheatNeighborhood(idx)) {
			if (map[neighbor] === Tile.Wall) continue;
			const shortCutDistance = startToFinish[idx] + finishToStart[neighbor] + manhattanDistance(idx, neighbor);
			if (shortCutDistance <= target) {
				counter++;
			}
		}
	}
	return counter;

	function* cheatNeighborhood(idx: number): Generator<number> {
		const x = idx % width;
		const y = Math.floor(idx / width);

		for (let dy = Math.max(-cheatDistance, -y); dy < Math.min(cheatDistance + 1, height - y); ++dy) {
			const cheatWidth = cheatDistance - Math.abs(dy);
			for (let dx = Math.max(-cheatWidth, -x); dx < Math.min(cheatWidth + 1, width - x); ++dx) {
				// Optimization that makes things worse ^^'
				// if (dy > -2 && dy < 2 && dx > -2 && dx < 2) continue;
				yield x + dx + (y + dy) * width;
			}
		}
	}
}

function makeSeekMap(from: number, to: number): Uint32Array {
	const ret = new Uint32Array(map.length).fill(MaxU32bit);
	let check = new Set([from]);
	ret[from] = 0;

	while (check.size > 0) {
		const pos = check.values().next().value!;
		check.delete(pos);
		let value = ret[pos] + 1;
		for (const neighbor of getNeighbors(pos)) {
			if (map[neighbor] === Tile.Wall) continue;
			if (ret[neighbor] > value) {
				ret[neighbor] = value;
				check.add(neighbor);
			}
		}
	}

	return ret;
}

function bestPathTiles(seekMap: Uint32Array): Set<number> {
	const ret = new Set<number>();
	let current = endIdx;
	while (true) {
		ret.add(current);
		const nextVal = seekMap[current] - 1;
		if (nextVal < 0 || current === startIdx) break;
		for (const neighbor of getNeighbors(current)) {
			if (seekMap[neighbor] === nextVal) {
				current = neighbor;
				break;
			}
		}
	}
	return ret;
}

function* getNeighbors(idx: number): Generator<number> {
	yield idx - 1;
	yield idx + 1;
	yield idx - width;
	yield idx + width;
}

function manhattanDistance(from: number, to: number) {
	const fx = from % width;
	const fy = Math.floor(from / width);
	const tx = to % width;
	const ty = Math.floor(to / width);
	return Math.abs(fx - tx) + Math.abs(fy - ty);
}
