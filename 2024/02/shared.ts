import * as exp from "constants";
import { promises as fs } from "fs";

export async function* getLevels(filePath: string = import.meta.dirname + "/input.txt") {
	let file: fs.FileHandle;
	try {
		file = await fs.open(filePath, "r");
	} catch (e) {
		console.error("No input file found");
		console.error(e);
		process.exit(1);
	}

	for await (const report of file.readLines()) {
		const levels = report.split(' ').map((x: string) => parseInt(x));
		yield levels;
	}
}

export function areLevelsSafe(levels: number[]): boolean {
	const levelChanges = levels.map((x, i) => x - levels[i - 1]).slice(1);
	return levelChanges.every(x => x === 1 || x === 2 || x === 3) || levelChanges.every(x => x === -1 || x === -2 || x === -3)
}
