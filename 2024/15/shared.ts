export enum Tile {
	Floor = 0,
	Wall = 1,
	Box = 2,
	LeftBoxHalf = 3,
	RightBoxHalf = 4,
}

export class World {
	map: Uint8Array;
	width: number;
	height: number;

	robotIdx: number = 0;
	// Active if there are no wide boxes on the map
	smallMode: boolean = true;

	constructor(lines: string[]) {
		this.height = lines.length;
		this.width = lines[0].length;
		this.map = new Uint8Array(this.width * this.height).fill(Tile.Floor);
		for (let y = 0; y < this.height; y++) {
			const yOffset = y * this.width;
			for (let x = 0; x < this.width; x++) {
				switch (lines[y][x]) {
					case "#":
						this.map[yOffset + x] = Tile.Wall;
						break;
					case "@":
						this.robotIdx = yOffset + x;
						break;
					case "O":
						this.map[yOffset + x] = Tile.Box;
						break;
					case "[":
						this.map[yOffset + x] = Tile.LeftBoxHalf;
						this.smallMode = false;
						break;
					case "]":
						this.map[yOffset + x] = Tile.RightBoxHalf;
						this.smallMode = false;
						break;
				}
			}
		}
		this.validate();
	}

	validate() {
		// Check that the map is surrounded by walls. This lets us ignore out of bounds checks,
		// which makes index based addressing of fields easier.
		for (let y = 0; y < this.height; y++) {
			if (this.map[y * this.width] !== Tile.Wall || this.map[(y + 1) * this.width - 1] !== Tile.Wall) {
				throw new Error("Map is not surrounded by walls");
			}
		}
		for (let x = 0; x < this.width; x++) {
			if (this.map[x] !== Tile.Wall || this.map[this.map.length - x - 1] !== Tile.Wall) {
				throw new Error("Map is not surrounded by walls");
			}
		}
	}

	step(movement: string) {
		let delta = 0;
		switch (movement) {
			case "v":
				delta = this.width;
				break;
			case "^":
				delta = -this.width;
				break;
			case ">":
				delta = 1;
				break;
			case "<":
				delta = -1;
				break;
			default:
				throw new Error(`Invalid movement: ${movement}`);
		}
		const targetIdx = this.robotIdx + delta;

		if (this.map[targetIdx] === Tile.Wall) {
			return;
		}
		if (this.map[targetIdx] === Tile.Box) {
			if (this.smallMode) {
				// If there are no wide boxes, we don't need recursion
				let endOfBoxesIdx = targetIdx;
				do {
					endOfBoxesIdx += delta;
				} while (this.map[endOfBoxesIdx] === Tile.Box);
				if (this.map[endOfBoxesIdx] === Tile.Wall) {
					// Wall in the way, can't move box
					return;
				}
				this.map[endOfBoxesIdx] = Tile.Box;
				this.map[targetIdx] = Tile.Floor;
			} else {
				this.moveBox(targetIdx, delta);
			}
		} else if (this.map[targetIdx] === Tile.LeftBoxHalf || this.map[targetIdx] === Tile.RightBoxHalf) {
			if (!this.moveBox(targetIdx, delta)) {
				return;
			}
		}
		this.robotIdx = targetIdx;
	}

	moveBox(targetIdx: number, delta: number): boolean {
		let newMap = structuredClone(this.map);
		if (moveBoxRec(newMap, targetIdx, delta)) {
			this.map = newMap;
			return true;
		}
		return false;
	}

	gpsSum(): number {
		let sum = 0;
		const gpsCoordWidth = 100;
		for (let idx = 0; idx < this.map.length; idx++) {
			if (this.map[idx] === Tile.Box || this.map[idx] === Tile.LeftBoxHalf) {
				const x = idx % this.width;
				const y = Math.floor(idx / this.width);
				sum += y * gpsCoordWidth + x;
			}
		}
		return sum;
	}

	debugPrint() {
		console.log("World:");
		for (let y = 0; y < this.height; y++) {
			let line = "";
			for (let x = 0; x < this.width; x++) {
				const idx = y * this.width + x;
				if (idx === this.robotIdx) {
					line += "@";
					continue;
				}

				switch (this.map[idx]) {
					case Tile.Wall:
						line += "#";
						break;
					case Tile.Box:
						line += "O";
						break;
					case Tile.LeftBoxHalf:
						line += "[";
						break;
					case Tile.RightBoxHalf:
						line += "]";
						break;
					case Tile.Floor:
						line += " ";
						break;
				}
			}
			console.log(line);
		}
	}
}

function moveBoxRec(
	newMap: Uint8Array<ArrayBufferLike>,
	idx: number,
	delta: number,
	fromOtherBoxSide: boolean = false,
): boolean {
	const tile = newMap[idx];
	const targetIdx = idx + delta;
	if (tile === Tile.Wall) {
		return false;
	}
	if (tile === Tile.Floor) {
		return true;
	}
	const isSideWays = delta === -1 || delta === 1;
	const isBoxHalf = tile === Tile.LeftBoxHalf || tile === Tile.RightBoxHalf;
	// When moving sideways, long boxes behave the same as short boxes
	if (tile === Tile.Box || isBoxHalf) {
		if (moveBoxRec(newMap, targetIdx, delta)) {
			newMap[idx] = Tile.Floor;
			newMap[targetIdx] = tile;
			if (isBoxHalf && !isSideWays && !fromOtherBoxSide) {
				return moveBoxRec(newMap, tile === Tile.LeftBoxHalf ? idx + 1 : idx - 1, delta, true);
			}
			return true;
		}
	}
	return false;
}
