import { readFileLines } from "../shared";

/**
 * The idea behind this is that we know what an adding machine should look like, and we can
 * compare it to the input data.
 *
 * Unfortunately, this currently improperly detects frg as being wrong, and doesn't detect
 * fdv as being wrong.
 */

const ands = new Map<string, [string, string]>();
const ors = new Map<string, [string, string]>();
const xors = new Map<string, [string, string]>();

const inputRegisters = new Set<string>();

for await (const input of readFileLines(import.meta.dirname + "/input.txt")) {
	if (input.includes(":")) {
		const [name] = input.split(":");
		inputRegisters.add(name);
		continue;
	}

	const match = input.match(/(\w+) (AND|OR|XOR) (\w+) -> (\w+)/);
	if (!match) continue;
	const [, regA, op, regB, regTarget] = match;

	let map: Map<string, [string, string]> = {
		AND: ands,
		OR: ors,
		XOR: xors,
	}[op as "AND" | "OR" | "XOR"];
	map.set(regTarget, [regA, regB]);
}

const xRegisters = inputRegisters
	.keys()
	.filter((x) => x.startsWith("x"))
	.toArray();
const yRegisters = inputRegisters
	.keys()
	.filter((x) => x.startsWith("y"))
	.toArray();

if (xRegisters.length + yRegisters.length !== inputRegisters.size || xRegisters.length !== yRegisters.length) {
	throw new Error("Unexpected registers");
}

if (ors.size !== xRegisters.length - 1) throw new Error("Wrong number of ors");
if (ands.size !== inputRegisters.size - 1) throw new Error("Wrong number of ands");
if (xors.size !== inputRegisters.size - 1) throw new Error("Wrong number of xors");

/**
 * Each full adder has two half adders (HA) that consist of an and and an xor.
 * The ands of the second ha are identified by leading to a z register.
 * The ands and xors of the first HA are identified by leading to an x or y register.
 * The remaining xors belong to the second HA.
 */

const borken = new Set<string>();
const ha1Xors = new Map<string, [string, string]>();
const ha1Ands = new Map<string, [string, string]>();

const ha2Xors = new Map<string, [string, string]>();
const ha2Ands = new Map<string, [string, string]>();

for (const [regTarget, [regA, regB]] of xors) {
	// The first inputs only have one ha, since they don't have a carry
	if (regTarget.startsWith("z") && regTarget !== "z00") {
		ha2Xors.set(regTarget, [regA, regB]);
		continue;
	} else {
		if (regA.startsWith("y") || regA.startsWith("x") || regB.startsWith("y") || regB.startsWith("x")) {
			if (regA.startsWith("x") && regB !== "y" + regA.slice(1)) {
				borken.add(regB);
				console.log("Broken ha1Xor input", regTarget, regB);
			} else if (regB.startsWith("x") && regA !== "y" + regB.slice(1)) {
				borken.add(regA);
				console.log("Broken ha1Xor input", regTarget, regA);
			}
			ha1Xors.set(regTarget, [regA, regB]);
		} else {
			console.log(`Broken xor of ha2 (${explainWire(regTarget)}) should connect to an output.`);
			ha2Xors.set(regTarget, [regA, regB]);
			borken.add(regTarget);
		}
	}
}

function explainWire(id: string) {
	const and = ands.get(id);
	if (and !== undefined) return `${id} (= ${and[0]} & ${and[1]})`;
	const xor = xors.get(id);
	if (xor !== undefined) return `${id} (= ${xor[0]} ^ ${xor[1]})`;
	const or = ors.get(id);
	if (or !== undefined) return `${id} (= ${or[0]} | ${or[1]})`;
	return id + " (unknown)";
}

for (const [regTarget, [regA, regB]] of ands) {
	if (regA.startsWith("y") || regA.startsWith("x") || regB.startsWith("y") || regB.startsWith("x")) {
		if (regA.startsWith("x") && !regB.startsWith("y")) {
			borken.add(regB);
			console.log("Broken ha1And input", regB);
		} else if (regB.startsWith("x") && !regA.startsWith("y")) {
			borken.add(regA);
			console.log("Broken ha1And input", regA);
		}
		ha1Ands.set(regTarget, [regA, regB]);
		continue;
	}
	ha2Ands.set(regTarget, [regA, regB]);
}

for (let i = 0; i < xRegisters.length; i++) {
	const zRegisterId = "z" + i.toString().padStart(2, "0");
	const outputXor = i === 0 ? ha1Xors.get(zRegisterId) : ha2Xors.get(zRegisterId);
	if (outputXor === undefined) {
		console.log("Missing output xor", i);
		borken.add(zRegisterId);
		continue;
	}
}

for (const or of ors) {
	const [regTarget, [regA, regB]] = or;
	if (!ha1Ands.has(regB) && !ha2Ands.has(regB)) {
		console.log("Broken orInput", regTarget, regB);
		borken.add(regB);
	}
	if (!ha2Ands.has(regA) && !ha1Ands.has(regA)) {
		console.log("Broken orInput", regTarget, regA);
		borken.add(regA);
	}
}

for (const ha1Xor of ha1Xors) {
	const [regTarget, [regA, regB]] = ha1Xor;

	if (!ha1Ands.values().find(([a, b]) => (a === regA && b === regB) || (b === regA && a === regB))) {
		console.log("ha1Xor without fitting ha1And", regTarget, regA, regB);
	}
}

for (const ha1And of ha1Ands) {
	const [regTarget, [regA, regB]] = ha1And;

	if (!ha1Xors.values().find(([a, b]) => (a === regA && b === regB) || (b === regA && a === regB))) {
		console.log("ha1And without fitting ha1Xor", regTarget, regA, regB);
	}
}

for (const ha2Xor of ha2Xors) {
	const [regTarget, [regA, regB]] = ha2Xor;

	if (!ha2Ands.values().find(([a, b]) => (a === regA && b === regB) || (b === regA && a === regB))) {
		console.log("ha2Xor without fitting ha2And", regTarget, regA, regB);
	}
}

for (const ha2And of ha2Ands) {
	const [regTarget, [regA, regB]] = ha2And;

	if (!ha2Xors.values().find(([a, b]) => (a === regA && b === regB) || (b === regA && a === regB))) {
		console.log("ha2And without fitting ha2Xor", regTarget, regA, regB);
	}
}

for (const ha2Xor of ha2Xors) {
	const [regTarget, [regA, regB]] = ha2Xor;
	if (!ors.has(regA) && !ors.has(regB)) {
		if (ha1Xors.has(regA)) {
			console.log("Broken ha2Xor to or connection 1", regTarget, regB, regA);
			borken.add(regB);
		} else if (ha1Xors.has(regB)) {
			console.log("Broken ha2Xor to or connection 2", regTarget, regA, regB);
			borken.add(regA);
		} else {
			console.log("Broken ha2Xor", regTarget, regA, regB);
		}
	}
}

for (const ha2And of ha2Ands) {
	const [regTarget, [regA, regB]] = ha2And;
	if (!ors.has(regA) && !ors.has(regB)) {
		if (ha1Xors.has(regA)) {
			console.log("Broken ha2And to or connection 1", regTarget, regB, regA);
			borken.add(regB);
		} else if (ha1Xors.has(regB)) {
			console.log("Broken ha2And to or connection 2", regTarget, regA, regB);
			borken.add(regA);
		} else {
			console.log("Broken ha2And", regTarget, regA, regB);
		}
	}
}

console.log(Array.from(borken).sort().join(","));
