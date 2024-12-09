import { checksum, EntryType, readDisk } from "../shared";

const disk = await readDisk(`${import.meta.dirname}/../input.txt`);
let fileId = disk.findLast((entry) => entry.type === EntryType.Filled)!.id;

// i > 1 is intentional, the zeroth entry cannot be moved further, the first is either entry or a
// file we put there
for (let i = disk.length - 1; i > 1; i--) {
	const currentEntry = disk[i];
	if (currentEntry.type === EntryType.Empty) continue;
	// We have already moved this file, so we can skip it
	if (currentEntry.id > fileId) continue;
	for (let emptySeek = 1; emptySeek < i; emptySeek++) {
		if (disk[emptySeek].type === EntryType.Empty && disk[emptySeek].size >= currentEntry.size) {
			disk[i] = { type: EntryType.Empty, size: currentEntry.size };
			if (disk[emptySeek].size === currentEntry.size) {
				disk[emptySeek] = currentEntry;
			} else {
				disk[emptySeek].size -= currentEntry.size;
				disk.splice(emptySeek, 0, currentEntry);
				// Adjust for new entry
				i++;
			}
			fileId = currentEntry.id;
			break;
		}
	}
}

console.log(checksum(disk));
