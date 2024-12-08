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
	if (typeof Bun !== "undefined") {
		const reader = Bun.file(path).stream().pipeThrough(new TextDecoderStream("utf-8")).getReader();

		let remainder = "";
		while (true) {
			const { value, done } = await reader.read();
			if (done) break;
			let lines = (remainder + value).split(/\r?\n/);
			remainder = lines.pop()!;

			for (const line of lines) {
				yield line;
			}
		}

		if (remainder) {
			yield remainder;
		}
	} else {
		const file = await openFile(path);
		for await (const line of file.readLines()) {
			yield line;
		}
	}
}
