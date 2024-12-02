import { getLevels } from "../shared";

let safeNr = 0;
let total = 0;

for await (const levels of getLevels()) {
	total++;
	let safe = true;
	// Problem: We can't just rely on the first level change to determine the direction, it might
	// be the problematic one that gets dampened.
	// So its rising if two of the three level changes are rising, otherwise it's falling.
	const rising = (+(levels[0] < levels[1]) + +(levels[1] < levels[2]) + +(levels[2] < levels[3])) >= 2;
	let problemDampend = false;

	for (let i = 0; i < levels.length; i++) {
		if (safeChange(levels[i + 1] - levels[i])) {
			// Safe level change, nothing to fix
		} else if (problemDampend) {
			// Already dampened, can't do it again
			safe = false;
			break;
		} else {
			if (safeChange(levels[i + 2] - levels[i])) {
				// Taking out the next level would make it safe
				problemDampend = true;
				levels.splice(i + 1, 1);
				i--;
			} else if (safeChange(levels[i + 1] - levels[i - 1])) {
				// Taking out this level would make it safe
				problemDampend = true;
				levels.splice(i, 1);
				i--;
			} else {
				// No fix in sight
				safe = false;
				break;
			}
		}
	}

	if (safe) {
		safeNr++;
	}

	/**
	 * Tests if the difference between two levels is safe, based on whether the series is rising or
	 * falling.
	 * @param change [level from] - [level to] (Out of bounds access in that equation is explicitly
	 *                                          allowed, don't worry about it)
	 */
	function safeChange(change: number): boolean {
		if (isNaN(change)) {
			// NaN means one of the numbers was undefined, so we are either at the start or the
			// end. The comparison to the bounds should always succeed.
			return true;
		}
		if (rising && change > 0 && change <= 3) {
			return true;
		} else if (!rising && change < 0 && change >= -3) {
			return true;
		}
		return false;
	}
}

console.log(`${safeNr}/${total} are safe`);
