import { readFileLines } from "../../shared";

const costA = 3;
const costB = 1;

if (import.meta.main) {
	let sum = 0;

	for await (const { ax, ay, bx, by, prizeX, prizeY } of readMachines(import.meta.dirname + "/../input.txt")) {
		sum += solve(ax, ay, bx, by, prizeX, prizeY);
	}
	console.log(sum);
}

export async function* readMachines(
	file: string,
): AsyncGenerator<{ ax: number; ay: number; bx: number; by: number; prizeX: number; prizeY: number }> {
	let ax = 0;
	let ay = 0;
	let bx = 0;
	let by = 0;

	let prizeX = 0;
	let prizeY = 0;

	for await (const line of readFileLines(file)) {
		if (line === "") {
			yield { ax, ay, bx, by, prizeX, prizeY };
		} else if (line.startsWith("Button A: ")) {
			const [x, y] = line
				.slice(10)
				.match(/X([+-]?\d+), Y([+-]?\d+)/)!
				.slice(1)
				.map((x) => parseInt(x));
			ax = x;
			ay = y;
		} else if (line.startsWith("Button B: ")) {
			const [x, y] = line
				.slice(10)
				.match(/X([+-]?\d+), Y([+-]?\d+)/)!
				.slice(1)
				.map((x) => parseInt(x));
			bx = x;
			by = y;
		} else if (line.startsWith("Prize: ")) {
			const [x, y] = line
				.slice(7)
				.match(/X=(\d+), Y=(\d+)/)!
				.slice(1)
				.map((x) => parseInt(x));
			prizeX = x;
			prizeY = y;
		}
	}
	yield { ax, ay, bx, by, prizeX, prizeY };
}

export function solve(ax: number, ay: number, bx: number, by: number, prizeX: number, prizeY: number): number {
	// I solved the equation system:
	//   prizeX = a * ax + b * bx
	//   prizeY = a * ay + b * by
	// for b. This resulted in this equation:
	const b = Math.round((prizeY / ay - prizeX / ax) / (by / ay - bx / ax));
	const a = (prizeX - b * bx) / ax;

	if (a % 1 === 0 && ax * a + bx * b === prizeX && ay * a + by * b === prizeY) {
		return a * costA + b * costB;
	}

	return 0;
}
