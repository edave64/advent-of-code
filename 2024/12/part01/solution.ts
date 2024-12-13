import { readFileLines } from "../../shared";

class Region {
	public constructor(public plant: string) {}
	public area: number = 0;
	public perimeter: number = 0;
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
				lastRegion.perimeter += region.perimeter;
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
		if (newRegions[i - 1]?.plant !== plant) {
			// Left perimeter (Including when it's the leftmost)
			region.perimeter += 1;
			if (newRegions[i - 1]) {
				// Right bordering perimeter
				newRegions[i - 1]!.perimeter += 1;
			}
		}
		if (lastRegions[i]?.plant !== plant) {
			// Top perimeter (Including when it's the topmost)
			region.perimeter += 1;
			if (lastRegions[i]) {
				// Top bordering perimeter
				lastRegions[i]!.perimeter += 1;
			}
		}
	}

	// Add the right perimeter to the last region
	newRegions.at(-1)!.perimeter += 1;
	lastRegions = newRegions;
}
for (const region of lastRegions) {
	// Add bottom perimeter to all the last regions
	region!.perimeter += 1;
}

let sum = 0;

for (const region of allRegions) {
	console.log(region.plant, region.area, region.perimeter);
	sum += region.area * region.perimeter;
}

console.log(sum);
