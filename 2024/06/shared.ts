import { promises as fs } from "fs";

export enum MapTile {
	Empty,
	Obstacle,
	WalkedUp,
	WalkedRight,
	WalkedDown,
	WalkedLeft,
}

export class World {
	public static async load(path: string): Promise<World> {
		let file: fs.FileHandle;
		try {
			file = await fs.open(path, "r");
		} catch (e) {
			console.error("No input file found");
			console.error(e);
			process.exit(1);
		}

		const lines: string[] = [];

		for await (const line of file.readLines()) {
			lines.push(line);
		}
		const width = lines[0].length;
		const height = lines.length;
		const map = new Uint8Array(height * width);

		let guardX = 0;
		let guardY = 0;
		let guardDir = MapTile.WalkedUp;

		for (let y = 0; y < height; ++y) {
			const line = lines[y];
			const yOffset = y * width;
			for (let x = 0; x < width; ++x) {
				map[yOffset + x] = line[x] === "#" ? MapTile.Obstacle : MapTile.Empty;
				if (line[x] === "^") {
					guardX = x;
					guardY = y;
					map[yOffset + x] = guardDir;
				}
			}
		}
		return new World(width, height, map, guardX, guardY, guardDir);
	}

	public guardIdx: number;

	private constructor(
		readonly width: number,
		readonly height: number,
		readonly map: Uint8Array,
		guardX: number,
		guardY: number,
		public guardDir: MapTile,
	) {
		this.guardIdx = this.posToIndex(guardX, guardY);
	}

	public clone(): World {
		return new World(
			this.width,
			this.height,
			structuredClone(this.map),
			...this.indexToPos(this.guardIdx),
			this.guardDir,
		);
	}

	public step(): boolean {
		const nextIdx = this.walk(this.guardDir);
		if (nextIdx === null) {
			// Guard walks off the map
			return false;
		}
		const nextTile = this.map[nextIdx];
		if (nextTile === MapTile.Obstacle) {
			this.guardDir = this.guardRotate();
		} else if (nextTile === this.guardDir) {
			// Based on the rules, this cannot happen, but if it were to happen, it means the guard
			// has entered a loop.
			// EDIT: Just reached part 2, hihi
			throw new Error("Guard entered a loop");
		} else {
			this.guardIdx = nextIdx;
			this.map[this.guardIdx] = this.guardDir;
		}
		return true;
	}

	posToIndex(x: number, y: number): number {
		return y * this.width + x;
	}

	indexToPos(index: number): [number, number] {
		return [index % this.width, Math.floor(index / this.width)];
	}

	walk(dir: MapTile): number | null {
		let [nextX, nextY] = this.indexToPos(this.guardIdx);
		switch (dir) {
			case MapTile.WalkedUp:
				nextY--;
				break;
			case MapTile.WalkedRight:
				nextX++;
				break;
			case MapTile.WalkedDown:
				nextY++;
				break;
			case MapTile.WalkedLeft:
				nextX--;
				break;
		}
		if (nextX < 0 || nextX >= this.width || nextY < 0 || nextY >= this.height) {
			// Guard walks off the map
			return null;
		}
		return this.posToIndex(nextX, nextY);
	}

	guardRotate(): MapTile {
		let nextDir = this.guardDir + 1;
		if (nextDir > MapTile.WalkedLeft) {
			nextDir = MapTile.WalkedUp;
		}
		return nextDir;
	}

	// Debug print
	print() {
		for (let y = 0; y < this.height; ++y) {
			let line = "";
			const slice = this.map.slice(y * this.width, (y + 1) * this.width);
			for (let x = 0; x < this.width; ++x) {
				const tile = slice[x];
				switch (tile) {
					case MapTile.Empty:
						line += ".";
						break;
					case MapTile.Obstacle:
						line += "#";
						break;
					case MapTile.WalkedUp:
						line += "^";
						break;
					case MapTile.WalkedRight:
						line += ">";
						break;
					case MapTile.WalkedDown:
						line += "v";
						break;
					case MapTile.WalkedLeft:
						line += "<";
						break;
					/*
				default:
					line += "X";
					break;*/
				}
			}
			console.log(line);
		}
	}
}
