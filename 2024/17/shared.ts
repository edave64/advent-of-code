import { readFileLines } from "../shared";

export async function readProgram(path: string): Promise<{ a: number; b: number; c: number; program: string }> {
	let a = 0;
	let b = 0;
	let c = 0;
	let program = "";
	for await (const line of readFileLines(path)) {
		const register = line.match(/Register (A|B|C): (\d+)/);
		if (register) {
			const [, reg, value] = register;
			switch (reg) {
				case "A":
					a = parseInt(value);
					break;
				case "B":
					b = parseInt(value);
					break;
				case "C":
					c = parseInt(value);
					break;
			}
		} else {
			const prog = line.match(/Program: (.*)/);
			if (prog) {
				program = prog[1];
			}
		}
	}
	return { a, b, c, program };
}
