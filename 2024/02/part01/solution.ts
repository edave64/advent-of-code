import { areLevelsSafe, getLevels } from "../shared";

let safeNr = 0;
let total = 0;

for await (const levels of getLevels()) {
	total++;
	if (areLevelsSafe(levels)) {
		safeNr++;
	}
}

console.log(`${safeNr}/${total} are safe`);
