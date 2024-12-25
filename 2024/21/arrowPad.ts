import { Step } from "./shared.ts";

// Maps every source pad button and target pad button to the corresponding series of button presses
export const arrowPadSnippets: Record<Step, Record<Step, Array<string>>> = {
	A: {
		A: ["A"],
		"^": ["<A"],
		"<": ["v<<A"],
		">": ["vA"],
		v: ["<vA", "v<A"],
	},
	"^": {
		A: [">A"],
		"^": ["A"],
		"<": ["v<A"],
		">": ["v>A", ">vA"],
		v: ["vA"],
	},
	"<": {
		A: [">>^A"],
		"^": [">^A"],
		"<": ["A"],
		">": [">>A"],
		v: [">A"],
	},
	">": {
		A: ["^A"],
		"^": ["<^A", "^<A"],
		"<": ["<<A"],
		">": ["A"],
		v: ["<A"],
	},
	v: {
		A: [">^A", "^>A"],
		"^": ["^A"],
		"<": ["<A"],
		">": [">A"],
		v: ["A"],
	},
};
