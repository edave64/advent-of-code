import { MapTile, World } from "../shared";

const map = await World.load(import.meta.dirname + "/../input.txt");

debugger;

while (map.step()) {}

// Number of positions
console.log(map.map.reduce((acc, val) => acc + +!(val === MapTile.Empty || val === MapTile.Obstacle), 0));
