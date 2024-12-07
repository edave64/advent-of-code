import { promises as fs } from "fs";

export async function openFile(path: string): Promise<fs.FileHandle> {
	let file: fs.FileHandle;
	try {
		return await fs.open(path, "r");
	} catch (e) {
		console.error(`No input file '${path}' found`);
		console.error(e);
		process.exit(1);
	}
}

export async function* readFileLines(path: string): AsyncIterableIterator<string> {
	const file = await openFile(path);
	for await (const line of file.readLines()) {
		yield line;
	}
}
