class NumPadBot implements PlayAble {
	static ButtonPos: Record<NumButton, [number, number]> = {
		A: [2, 3],
		"0": [1, 3],
		"1": [0, 2],
		"2": [1, 2],
		"3": [2, 2],
		"4": [0, 1],
		"5": [1, 1],
		"6": [2, 1],
		"7": [0, 0],
		"8": [1, 0],
		"9": [2, 0],
	};

	public readonly forbiddenX = 0;
	public readonly forbiddenY = 3;

	constructor(
		public x = 2,
		public y = 3,
	) {}

	play(btn: Step): void {
		switch (btn) {
			case "A":
				console.log(Object.entries(NumPadBot.ButtonPos).find(([, [x, y]]) => x === this.x && y === this.y)![0]);
				break;
			case "^":
				this.y--;
				break;
			case "<":
				this.x--;
				break;
			case ">":
				this.x++;
				break;
			case "v":
				this.y++;
				break;
		}
		if (this.y === this.forbiddenY && this.x === this.forbiddenX) {
			throw new Error("This move must move around the forbidden corner");
		}
		if (this.x < 0 || this.x > 3 || this.y < 0 || this.y > 3) {
			throw new Error("Invalid coordinate");
		}
	}
}

class ArrowKeyPadBot implements PlayAble {
	static ButtonPos: Record<Step, [number, number]> = {
		A: [2, 0],
		"^": [1, 0],
		"<": [0, 1],
		">": [2, 1],
		v: [1, 1],
	};

	private readonly forbiddenX = 0;
	private readonly forbiddenY = 0;
	private x = 2;
	private y = 0;

	constructor(public chain: PlayAble) {}

	play(btn: Step): void {
		switch (btn) {
			case "A":
				this.chain.play(
					Object.entries(ArrowKeyPadBot.ButtonPos).find(([, [x, y]]) => x === this.x && y === this.y)![0] as Step,
				);
				break;
			case "^":
				this.y--;
				break;
			case "<":
				this.x--;
				break;
			case ">":
				this.x++;
				break;
			case "v":
				this.y++;
				break;
		}
		if (this.y === this.forbiddenY && this.x === this.forbiddenX) {
			throw new Error("This move must move around the forbidden corner");
		}
		if (this.x < 0 || this.x > 2 || this.y < 0 || this.y > 1) {
			throw new Error("Invalid coordinate");
		}
	}
}
interface PlayAble {
	play(btn: Step): void;
}

export function playSequence(str: string): void {
	const bot = new ArrowKeyPadBot(new NumPadBot());
	for (const btn of str) {
		bot.play(btn as Step);
	}
}

type NumButton = "A" | "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
type Step = "<" | ">" | "^" | "v" | "A";
