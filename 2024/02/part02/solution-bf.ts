import { areLevelsSafe, getLevels } from "../shared";

let safeNr = 0;
let total = 0;

// I wrote this first, but just to verify that the other one worked, and to find the cases it would
// need to handle. :P

for await (const levels of getLevels()) {
	total++;
	let safe = false;

	if (areLevelsSafe(levels)) {
		safe = true;
	} else {
		// Problem dampening
		for (let i = 0; i < levels.length; i++) {
			// When we are working with only 1000 entries, we might as well assume CPU speed is
			// infinite :P
			if (areLevelsSafe([...levels.slice(0, i), ...levels.slice(i + 1)])) {
				safe = true;
				break;
			}
		}
	}

	if (safe) {
		safeNr++;
	}
}

console.log(`${safeNr}/${total} are safe`);
