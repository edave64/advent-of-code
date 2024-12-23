import { readFileLines } from "../shared";

const connections = new Map<string, Set<string>>();

for await (const input of readFileLines(import.meta.dirname + "/input.txt")) {
	for (const line of input.split("\n")) {
		const [a, b] = line.split("-");
		if (!connections.has(a)) connections.set(a, new Set());
		if (!connections.has(b)) connections.set(b, new Set());
		connections.get(a)!.add(b);
		connections.get(b)!.add(a);
	}
}

const groups = new Map<string, Set<string>>();

for (const [k, v] of connections.entries()) {
	if (k.startsWith("t")) {
		for (const con1 of v) {
			const con1Connections = connections.get(con1);
			if (con1Connections === undefined) continue;
			const overlap = v.intersection(con1Connections);
			for (const thirdOne of overlap) {
				const key = [k, con1, thirdOne].sort().join("-");
				if (!groups.has(key)) {
					const thirdOneCollection = connections.get(thirdOne);
					if (thirdOneCollection === undefined) continue;
					const levelThreeOverlap = overlap.intersection(thirdOneCollection);
					levelThreeOverlap.add(k);
					levelThreeOverlap.add(con1);
					levelThreeOverlap.add(thirdOne);
					groups.set(key, levelThreeOverlap);
				}
			}
		}
	}
}

console.log("Part 1: " + groups.size);

let currentMax: Set<string> = new Set();

const sorted = Array.from(groups.values()).sort((a, b) => b.size - a.size);

for (const group of sorted) {
	if (currentMax.size >= group.size) break;
	const commons = maxCommonConnections(group);
	if (currentMax.size >= commons.size) continue;
	currentMax = group;
}

console.log("Part 2: " + Array.from(currentMax).sort().join(","));

function maxCommonConnections(baseConnectionsSet: Set<string>): Set<string> {
	while (true) {
		const ary = Array.from(baseConnectionsSet);
		const missingIn = new Map<string, Set<string>>();

		for (let i = 0; i < ary.length; i++) {
			const diff = baseConnectionsSet.difference(connections.get(ary[i])!);
			// We don't expect a PC to know itself
			diff.delete(ary[i]);
			if (diff.size === 0) continue;
			for (const con of diff) {
				if (!missingIn.has(con)) missingIn.set(con, new Set());
				missingIn.get(con)!.add(ary[i]);
			}
		}

		if (missingIn.size === 0) return baseConnectionsSet;
		// Seek the entry that is missing in the most other entries
		const maxMissing = missingIn.entries().reduce((a, b) => (a[1].size > b[1].size ? a : b))[0];
		// Remove it
		baseConnectionsSet.delete(maxMissing);
	}
}
