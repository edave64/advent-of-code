import { Step } from "./shared.ts";

const ArrowForbiddenX = 0;
const ArrowForbiddenY = 0;
// Maps every source pad button and target pad button to the corresponding series of button presses
export const arrowPadSnippets: Record<Step, Record<Step, string>> = {
	A: {
		A: "A",
		"^": "<A",
		"<": "v<<A",
		">": "vA",
		v: "<vA",
	},
	"^": {
		A: ">A",
		"^": "A",
		"<": "v<A",
		">": "v>A",
		v: "vA",
	},
	"<": {
		A: ">>^A",
		"^": ">^A",
		"<": "A",
		">": ">>A",
		v: ">A",
	},
	">": {
		A: "^A",
		"^": "<^A",
		"<": "<<A",
		">": "A",
		v: "<A",
	},
	v: {
		A: ">^A",
		"^": "^A",
		"<": "<A",
		">": ">A",
		v: "A",
	},
};
