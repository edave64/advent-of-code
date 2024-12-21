class NumPadBot {
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

	*nextStep(btn: NumButton): Generator<Step[]> {
		const currentX = this.x;
		const currentY = this.y;
		const [nextX, nextY] = NumPadBot.ButtonPos[btn];

		this.x = nextX;
		this.y = nextY;
		if (nextY === currentY) {
			// horizontal move
			if (nextX === currentX) {
				yield ["A"];
			} else {
				yield [...horizontalLine(currentX, nextX), "A"];
			}
		} else if (nextX === currentX) {
			// vertical move
			if (nextY === currentY) {
				yield ["A"];
			} else {
				yield [...verticalLine(currentY, nextY), "A"];
			}
		} else {
			if (currentY === this.forbiddenY && nextX === this.forbiddenX) {
				// This move must move around the forbidden corner
				yield [...horizontalLine(currentX, 1), ...verticalLine(currentY, nextY), ...horizontalLine(1, nextX), "A"];
				yield [
					...horizontalLine(currentX, 1),
					...verticalLine(currentY, 2),
					...horizontalLine(1, nextX),
					...verticalLine(2, nextY),
					"A",
				];
				yield [...verticalLine(currentY, nextY), ...horizontalLine(currentX, nextX), "A"];
			} else if (currentX === this.forbiddenX && nextY === this.forbiddenY) {
				yield [...verticalLine(currentY, 2), ...horizontalLine(currentX, nextX), ...verticalLine(2, nextY), "A"];
				yield [
					...verticalLine(currentY, 2),
					...horizontalLine(currentX, 1),
					...verticalLine(2, nextY),
					...horizontalLine(1, nextX),
					"A",
				];
				yield [...horizontalLine(currentY, nextY), ...verticalLine(currentX, nextX), "A"];
			} else {
				yield [...verticalLine(currentY, nextY), ...horizontalLine(currentX, nextX), "A"];
				yield [...horizontalLine(currentX, nextX), ...verticalLine(currentY, nextY), "A"];
			}
		}
	}

	clone(): NumPadBot {
		return new NumPadBot(this.x, this.y);
	}
}

const numPadBot = new NumPadBot();
const input = "029A";

walk(input, 0, "", numPadBot);

function walk(str: string, i: number, prefix: string, numPadBot: NumPadBot) {
	if (str.length <= i) {
		console.log(prefix);
		return;
	}
	for (const letters of numPadBot.nextStep(str[i] as NumButton)) {
		walk(str, i + 1, prefix + letters.join(""), numPadBot.clone());
	}
}

function horizontalLine(from: number, to: number): Step[] {
	return new Array(Math.abs(to - from)).fill(to > from ? ">" : "<");
}

function verticalLine(from: number, to: number): Step[] {
	return new Array(Math.abs(to - from)).fill(to > from ? "v" : "^");
}

type NumButton = "A" | "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
type Step = "<" | ">" | "^" | "v" | "A";
