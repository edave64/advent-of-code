import { aStar, readData, Tile } from "./shared";

const { map, width, nextObstacles } = await readData(import.meta.dirname + "/input.txt", true);

let lastObstacle = 0;
while (true) {
	// Find the best path on the current map state
	const path = new Set(aStar(0, map!.length - 1, map!, width));
	if (path.size === 0) {
		// No more path, so the last obstacle closed of the path
		break;
	}
	do {
		// Drop obstacles until one intersects the path
		// Obstacles that don't land on the path cannot close of the exit
		const obstacle = nextObstacles.shift();
		if (obstacle === undefined) {
			throw new Error("No more obstacles");
		}
		map[obstacle] = Tile.Obstacle;
		lastObstacle = obstacle;
	} while (!path.has(lastObstacle));
}

console.log(`${lastObstacle % width},${Math.floor(lastObstacle / width)}`);
