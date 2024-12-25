import { readFileLines } from "../shared";

enum State {
	None,
	Key,
	Lock,
}

let state: State = State.None;
const currentHeights: Pins = [0, 0, 0, 0, 0];

const keys: Pins[] = [];
const locks: Pins[] = [];
let length = 0;

for await (const line of readFileLines(import.meta.dirname + "/input.txt")) {
	switch (state) {
		case State.None:
			if (line === "") break;
			if (line === "#####") {
				state = State.Lock;
			} else {
				state = State.Key;
			}
			break;
		case State.Key:
		case State.Lock:
			if (line === "" || (line === "#####" && length === 5)) {
				(state === State.Key ? keys : locks).push([...currentHeights]);
				state = State.None;
				currentHeights.fill(0);
				length = 0;
				break;
			}
			length++;
			for (let i = 0; i < line.length; i++) {
				if (line[i] === "#") {
					currentHeights[i]++;
				}
			}
			break;
	}
}
if (state !== State.None) {
	(state === State.Key ? keys : locks).push([...currentHeights]);
}

let combos = 0;

for (const key of keys) {
	for (const lock of locks) {
		if (!hasOverlap(key, lock)) {
			combos++;
		}
	}
}

console.log(combos);

function hasOverlap(a: Pins, b: Pins) {
	return a[0] + b[0] > 5 || a[1] + b[1] > 5 || a[2] + b[2] > 5 || a[3] + b[3] > 5 || a[4] + b[4] > 5;
}

type Pins = [number, number, number, number, number];
