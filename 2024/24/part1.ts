import { readFileLines } from "../shared";

const registers = new Map<string, boolean | Promise<boolean>>();

for await (const input of readFileLines(import.meta.dirname + "/input.txt")) {
	if (input === "") continue;

	const setMatch = input.match(/(\w+): (0|1)/);
	if (setMatch) {
		const [, name, value] = setMatch;
		registers.set(name, value === "1");
		continue;
	}

	const [, regA, op, regB, regTarget] = input.match(/(\w+) (AND|OR|XOR) (\w+) -> (\w+)/)!;

	const promise = (async () => {
		const valueA = await resolveRegister(regA);
		const valueB = await resolveRegister(regB);

		if (op === "AND") return valueA && valueB;
		if (op === "OR") return valueA || valueB;
		if (op === "XOR") return valueA !== valueB;
		throw new Error("Unknown operation");
	})();

	if (pendingRegisters.has(regTarget)) {
		pendingRegisters.get(regTarget)!(promise);
	} else {
		registers.set(regTarget, promise);
	}
}

const zRegisters = registers
	.entries()
	.filter((entry) => entry[0].startsWith("z"))
	.toArray()
	.sort((a, b) => b[0].localeCompare(a[0]))
	.map((entry) => entry[1]);

const zValues = await Promise.all(zRegisters);
console.log(parseInt(zValues.map((x) => +x).join(""), 2));

function resolveRegister(name: string): Promise<boolean> | boolean {
	const value = registers.get(name);
	if (value !== undefined) return value;

	const promise = new Promise<boolean>((resolve, reject) => {
		pendingRegisters.set(name, async (actualPromise) => {
			try {
				const value = await actualPromise;
				resolve(value);
			} catch (e) {
				reject(e);
				return;
			}
		});
	});
	registers.set(name, promise);
	return promise;
}
