import { readFileLines } from "../../shared";
import { Tile, World } from "../shared";

let lines: string[] = [];
let world: World | null = null;
for await (const line of readFileLines(import.meta.dirname + "/../input.txt")) {
	if (line === "") {
		world = new World(lines);
		continue;
	}
	if (world === null) {
		let newLine: string = "";
		for (const char of line) {
			switch (char) {
				case "@":
					newLine += "@ ";
					break;
				case "O":
					newLine += "[]";
					break;
				default:
					newLine += char + char;
					break;
			}
		}
		lines.push(newLine);
	} else {
		for (let i = 0; i < line.length; i++) {
			world.step(line[i]);
		}
	}
}

console.log(world!.gpsSum());
