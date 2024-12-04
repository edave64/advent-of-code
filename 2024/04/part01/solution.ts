import { promises as fs } from "fs";

let file: fs.FileHandle;
try {
	file = await fs.open(import.meta.dirname + "/../input.txt", "r");
} catch (e) {
	console.error("No input file found");
	console.error(e);
	process.exit(1);
}

const grid: string[][] = [];
let count = 0;

for await (const line of file.readLines()) {
	grid.push(line.split(""));
	// I haven't tested it, but I'm just going to assume that counting with a trivial regex is
	// faster than seeking in the grid
	count += (line.match(/XMAS/g)?.length ?? 0) + (line.match(/SAMX/g)?.length ?? 0);
}

for (let y = 0; y < grid.length; ++y) {
	for (let x = 0; x < grid[y].length; ++x) {
		if (grid[y][x] === "X") {
			count +=
				+(seek(x, y, -1, -1) === "XMAS") + // Up - Left
				+(seek(x, y, 0, -1) === "XMAS") + //  Up
				+(seek(x, y, 1, -1) === "XMAS") + //  Up - Right
				// Left and right were already counted in the previous loop
				+(seek(x, y, -1, 1) === "XMAS") + //  Down - Left
				+(seek(x, y, 0, 1) === "XMAS") + //   Down
				+(seek(x, y, 1, 1) === "XMAS"); //    Down - Right
		}
	}
}

function seek(x: number, y: number, dx: number, dy: number): string {
	let ret = "";
	for (let i = 0; i < 4; i++) {
		ret += grid[y + dy * i]?.[x + dx * i];
	}
	return ret;
}

console.log(count);
