import { readFileLines } from "../shared";

export async function* getLevels(filePath: string = import.meta.dirname + "/input.txt") {
	for await (const report of readFileLines(filePath)) {
		const levels = report.split(" ").map((x: string) => parseInt(x));
		yield levels;
	}
}

export function areLevelsSafe(levels: number[]): boolean {
	const levelChanges = levels.map((x, i) => x - levels[i - 1]).slice(1);
	return (
		levelChanges.every((x) => x === 1 || x === 2 || x === 3) ||
		levelChanges.every((x) => x === -1 || x === -2 || x === -3)
	);
}
