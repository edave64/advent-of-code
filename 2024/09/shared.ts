import { readFileLines } from "../shared";

export enum EntryType {
	Empty,
	Filled,
}

export async function readDisk(path: string): Promise<Entry[]> {
	const disk: Entry[] = [];
	let nextType: EntryType = EntryType.Filled;
	let fileId = 0;

	for await (const line of readFileLines(path)) {
		for (const char of line) {
			const size = Number(char);
			if (size > 0) {
				if (nextType === EntryType.Empty) {
					disk.push({
						type: nextType,
						size,
					});
				} else {
					disk.push({
						type: nextType,
						size,
						id: fileId++,
					});
				}
			}
			nextType = nextType === EntryType.Filled ? EntryType.Empty : EntryType.Filled;
		}
	}

	return disk;
}

export function checksum(disk: Entry[]): number {
	let i = 0;
	let sum = 0;

	for (const entry of disk) {
		if (entry.type === EntryType.Filled) {
			for (let inEntry = 0; inEntry < entry.size; inEntry++) {
				sum += entry.id * (inEntry + i);
			}
		}
		i += entry.size;
	}

	return sum;
}

export function debugLog(disk: Entry[]) {
	console.log(
		disk
			.map((entry) => new Array(entry.size).fill(entry.type === EntryType.Empty ? "." : entry.id.toString()).join(""))
			.join(""),
	);
}

type EmptyEntry = {
	type: EntryType.Empty;
	size: number;
};

type FilledEntry = {
	type: EntryType.Filled;
	size: number;
	id: number;
};

type Entry = EmptyEntry | FilledEntry;
