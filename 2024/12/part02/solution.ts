import { readFileLines } from "../../shared";

class Region {
	public constructor(public plant: string) {}
	public area: number = 0;
	public sides: number = 0;
}

const allRegions: Set<Region> = new Set();
let lastRegions: (Region | undefined)[] = [];
for await (const line of readFileLines(import.meta.dirname + "/../input.txt")) {
	const newRegions: (Region | undefined)[] = [];
	const mergedRegions = new Map<Region, Region>();
	for (let i = 0; i < line.length; i++) {
		const plant = line[i];
		let region: Region | undefined = undefined;
		if (newRegions[i - 1]?.plant === plant) {
			region = newRegions[i - 1]!;
		}
		const lastRegion = lastRegions[i];
		if (lastRegion?.plant === plant) {
			if (region && lastRegion !== region && !mergedRegions.has(region)) {
				// If we found a region with the same plant to the left and one to the top with the
				// same plant, but they currently different region objects, merge them.
				lastRegion.area += region.area;
				lastRegion.sides += region.sides;
				// The region has been absorbed. Take it out of the list
				allRegions.delete(region!);
				mergedRegions.set(region, lastRegion);
				// Remove the old region from history
				for (let j = i - 1; j >= 0; j--) {
					if (newRegions[j]! === region) {
						newRegions[j] = lastRegion;
					}
				}
				region = lastRegion;
			} else if (!region) {
				region = lastRegions[i]!;
			}
		}
		if (!region) {
			region = new Region(plant);
			allRegions.add(region);
		}
		newRegions.push(region);
		region.area += 1;
		const left = newRegions[i - 1];
		const top = lastRegion;
		const topLeft = lastRegions[i - 1];
		if (left?.plant !== plant && top?.plant !== plant) {
			// Top and left bordering sides
			region.sides += 2;
			if (left && left!.plant === topLeft?.plant && top?.plant === left?.plant) {
				// Right and bottom bordering sides
				left!.sides += 2;
			}
			if (left && left?.plant !== topLeft?.plant) {
				// Right bordering side
				left!.sides += 1;
			}
			if (top && top?.plant !== topLeft?.plant) {
				// Bottom bordering side
				top.sides += 1;
			}
		} else {
			if (left?.plant !== plant && topLeft?.plant !== left?.plant) {
				if (top?.plant !== plant || topLeft?.plant === plant) {
					// Left bordering side
					region.sides += 1;
				}
				if (left) {
					// Right bordering side
					left!.sides += 1;
				}
			} else if (top?.plant !== plant && topLeft?.plant !== top?.plant) {
				if (left?.plant !== plant || topLeft?.plant === plant) {
					// Top bordering side
					region.sides += 1;
				}
				if (top) {
					// Bottom bordering side
					top.sides += 1;
				}
			}
		}
	}

	if (lastRegions?.at(-1)?.plant !== newRegions.at(-1)?.plant) {
		// Last right bordering side
		newRegions.at(-1)!.sides += 1;
	}

	lastRegions = newRegions;
}

let currentLastRegion: Region | undefined = undefined;
for (const region of lastRegions) {
	if (currentLastRegion !== region) {
		// Add bottom side to all the last regions
		region!.sides += 1;
	}
	currentLastRegion = region;
}

let sum = 0;

for (const region of allRegions) {
	//console.log(region.plant, region.area, region.sides);
	sum += region.area * region.sides;
}

console.log(sum);
