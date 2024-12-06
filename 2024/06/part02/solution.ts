import { MapTile, World } from "../shared";

const world = await World.load(import.meta.dirname + "/../input.txt");
const possiblePointsWorld = world.clone();

let possibleLoops = 0;

while (possiblePointsWorld.step()) {}

for (let i = 0; i < possiblePointsWorld.width * possiblePointsWorld.height; ++i) {
	if (possiblePointsWorld.map[i] !== MapTile.Empty && possiblePointsWorld.map[i] !== MapTile.Obstacle) {
		const testWorld = world.clone();
		testWorld.map[i] = MapTile.Obstacle;

		try {
			while (testWorld.step()) {}
		} catch (e) {
			if (e instanceof Error && e.message === "Guard entered a loop") {
				possibleLoops++;
			}
		}
	}
}

// Number of loops
console.log(possibleLoops);
