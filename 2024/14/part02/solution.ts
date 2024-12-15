import { readFileLines } from "../../shared";
import { createInterface } from "node:readline";

const rl = createInterface({
	input: process.stdin,
	output: process.stdout,
});

let first = true;
let width = 0;
let height = 0;

const robots: { x: number; y: number; vx: number; vy: number }[] = [];

for await (const line of readFileLines(import.meta.dirname + "/../input.txt")) {
	if (first) {
		first = false;
		const [w, h] = line.split(" ");
		width = parseInt(w);
		height = parseInt(h);
	} else {
		const [x, y, vx, vy] = line
			.match(/p=(\d+),(\d+) v=(-?\d+),(-?\d+)/)!
			.slice(1)
			.map((x) => parseInt(x));

		robots.push({ x, y, vx, vy });
	}
}

for (let i = 0; ; i++) {
	const map = new Array(height).fill(0).map(() => new Array(width).fill(0) as number[]);
	for (const { x, y, vx, vy } of robots) {
		const targetX = mod(x + vx * i, width);
		const targetY = mod(y + vy * i, height);
		map[targetY][targetX]++;
	}
	// Count the amount of times any field has a different value from it's left neighbor
	// This idea was just build of a hunch that this value would probably be smaller for
	// maps that contain discernible pictures.
	let discontinuity = 0;
	let lastLine: number[] = [];
	for (const line of map) {
		for (let x = 1; x < width; x++) {
			if (line[x] !== line[x - 1] && line[x] !== lastLine[x]) {
				discontinuity++;
			}
		}
		lastLine = line;
	}
	// This value was found by trial and error. I found the original tree by testing
	// for < 800 (The ones without visible patterns are typically ~900), which does find most of
	// the images with patterns. Then when I found the first tree image, this seemed like a good
	// value to find more.
	if (discontinuity > 300) {
		continue;
	}
	console.log(`Iteration ${i} discontinuity: ${discontinuity}`);

	for (const line of map) {
		console.log(line.map((x) => (x > 0 ? x : " ")).join(""));
	}
	const c = await shouldContinue();
	if (c === false) {
		break;
	} else if (typeof c === "number") {
		i = c;
	}
	//1802
}

async function shouldContinue(): Promise<boolean | number> {
	return new Promise((resolve, reject) => {
		rl.question("Continue? (y/n)", (answer) => {
			if (answer === "n") {
				resolve(false);
			}
			if (!isNaN(parseInt(answer))) {
				resolve(parseInt(answer));
			}
			resolve(true);
		});
	});
}

function mod(a: number, b: number): number {
	return ((a % b) + b) % b;
}
