import { readFileLines } from "../../shared";

if (import.meta.main) {
	let first = true;
	let width = 0;
	let height = 0;
	let halfWidth = 0;
	let halfHeight = 0;
	const iterations = 100;
	const quadrants: number[] = new Array(4).fill(0);

	for await (const line of readFileLines(import.meta.dirname + "/../input.txt")) {
		if (first) {
			first = false;
			const [w, h] = line.split(" ");
			width = parseInt(w);
			height = parseInt(h);
			halfWidth = Math.floor(width / 2);
			halfHeight = Math.floor(height / 2);
		} else {
			const [x, y, vx, vy] = line
				.match(/p=(\d+),(\d+) v=(-?\d+),(-?\d+)/)!
				.slice(1)
				.map((x) => parseInt(x));

			const targetX = mod(x + vx * iterations, width);
			const targetY = mod(y + vy * iterations, height);

			if (targetX === halfWidth || targetY === halfHeight) {
				// The task says to ignore these for some reason
				continue;
			}

			const inRight = targetX > halfWidth;
			const inBottom = targetY > halfHeight;

			const quadrant = +inRight + 2 * +inBottom;
			quadrants[quadrant]++;
		}
	}

	console.log(quadrants.reduce((a, b) => a * b, 1));
}

function mod(a: number, b: number): number {
	return ((a % b) + b) % b;
}
