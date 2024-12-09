import { checksum, EntryType, readDisk } from "../shared";

const disk = await readDisk(`${import.meta.dirname}/../input.txt`);

// The first entry is always filled, so skip it
for (let i = 1; i < disk.length; i++) {
	const emptyEntry = disk[i];
	if (emptyEntry.type !== EntryType.Empty) continue;
	let last = disk.at(-1)!;
	if (last.type === EntryType.Empty) {
		disk.pop();
		// Retry
		i--;
		continue;
	}
	if (emptyEntry.size <= last.size) {
		disk[i] = {
			type: EntryType.Filled,
			size: emptyEntry.size,
			id: last.id,
		};
		last.size -= emptyEntry.size;
		if (last.size === 0) {
			disk.pop();
		}
	} else {
		disk.splice(i, 0, {
			type: EntryType.Filled,
			size: last.size,
			id: last.id,
		});
		emptyEntry.size -= last.size;
		disk.pop();
	}
}

// Technically, there may be duplicated entries, the last one specifically, but since we currently
// only put them in a linear string, it shouldn't matter.

console.log(checksum(disk));
