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
}

for (let y = 0; y < grid.length; ++y) {
	for (let x = 0; x < grid[y].length; ++x) {
		if (grid[y][x] === "A") {
			const diagonalToBottomRight =
				(grid[y - 1]?.[x - 1] === "M" && grid[y + 1]?.[x + 1] === "S") ||
				(grid[y - 1]?.[x - 1] === "S" && grid[y + 1]?.[x + 1] === "M");
			const diagonalToBottomLeft =
				(grid[y - 1]?.[x + 1] === "M" && grid[y + 1]?.[x - 1] === "S") ||
				(grid[y - 1]?.[x + 1] === "S" && grid[y + 1]?.[x - 1] === "M");

			if (diagonalToBottomRight && diagonalToBottomLeft) {
				count++;
			}
		}
	}
}

console.log(count);
