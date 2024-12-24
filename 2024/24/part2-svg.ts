import { writeFile } from "node:fs";
import { readFileLines } from "../shared";

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

let outSvg = `<?xml version="1.0" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN"
  "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg width='200' height='3000' viewBox='0 0 200 3000' xmlns="http://www.w3.org/2000/svg">
<style>text { font-size: 10px; }</style>\n`;

for (const input of Array.from(inputRegisters).sort()) {
	const [x, y] = inputPos(input, false);
	outSvg += `<text x="${x}" y="${y}">${input}</text>\n`;
}

const ha1Ands = new Map<string, [string, string]>();
const ha2Ands = new Map<string, [string, string]>();

const pendingInputs = new Map<string, Set<[number, number]>>();

const leftOverCoords = new Map<string, [number, number]>();

for (const [regTarget, [regA, regB]] of ands) {
	if (regA.startsWith("x") || regB.startsWith("x")) {
		ha1Ands.set(regTarget, [regA, regB]);
		const [x, y] = inputPos(regA.startsWith("x") ? regA : regB, true);
		outSvg += `<rect id="out_${regTarget}" title="${regTarget}" x="${x + 30}" y="${y - 10}" width="10" height="10" fill="red" />\n`;
		leftOverCoords.set(regTarget, [x + 40, y - 5]);
		outSvg += `<line class="l1" id="${regA}" x1="${x}" y1="${y - 5}" x2="${x + 30}" y2="${y - 6}" stroke="black" />\n`;
		const [x2, y2] = inputPos(regA.startsWith("x") ? regB : regA, true);
		outSvg += `<line class="l2" id="${regB}" x1="${x2}" y1="${y2 - 5}" x2="${x + 30}" y2="${y - 3}" stroke="black" />\n`;
		continue;
	} else {
		ha2Ands.set(regTarget, [regA, regB]);
	}
}

const ha1Xors = new Map<string, [string, string]>();
const ha2Xors = new Map<string, [string, string]>();

for (const [regOut, [regA, regB]] of xors) {
	if (regA.startsWith("x") || regB.startsWith("x")) {
		ha1Xors.set(regOut, [regA, regB]);
		const [x, y] = inputPos(regA.startsWith("x") ? regA : regB, true);
		outSvg += `<rect id="out_${regOut}" title="${regOut}" x="${x + 30}" y="${y}" width="10" height="10" fill="blue" />\n`;
		outSvg += `<line class="l3" x1="${x}" y1="${y - 5}" x2="${x + 30}" y2="${y + 3}" stroke="black" />\n`;
		const [x2, y2] = inputPos(regA.startsWith("x") ? regB : regA, true);
		outSvg += `<line class="l4" x1="${x2}" y1="${y2 - 5}" x2="${x + 30}" y2="${y + 6}" stroke="black" />\n`;
		if (regOut.startsWith("z")) {
			const [x2, y2] = outputPos(regOut);
			outSvg += `<line class="l5" x1="${x + 40}" y1="${y + 5}" x2="${x2}" y2="${y2}" stroke="black" />\n`;
		} else {
			leftOverCoords.set(regOut, [x + 40, y + 5]);
		}
		continue;
	} else {
		ha2Xors.set(regOut, [regA, regB]);
	}
}

for (const regOut of new Set([...ands.keys(), ...xors.keys(), ...ors.keys()])) {
	if (regOut.startsWith("z")) {
		const [x, y] = outputPos(regOut);
		outSvg += `<text x="${x}" y="${y}">${regOut}</text>\n`;
		leftOverCoords.set(regOut, [x, y]);
	}
}

for (const [regOut, [regA, regB]] of ha2Ands) {
	const reg = leftOverCoords.has(regA) ? regA : regB;
	const coords = leftOverCoords.get(reg);
	if (!coords) {
		console.log("Missing coords for ha2And", regOut, regA, regB);
		continue;
	}
	const [x, y] = coords;
	outSvg += `<rect id="out_${regOut}" title="${regOut}" x="${x + 20}" y="${y - 5}" width="10" height="10" fill="red" />\n`;
	outSvg += `<line class="l6" id="${reg}" x1="${x}" y1="${y}" x2="${x + 20}" y2="${y}" stroke="black" />\n`;
	if (regOut.startsWith("z")) {
		const [x2, y2] = outputPos(regOut);
		outSvg += `<line class="l7" x1="${x + 30}" y1="${y}" x2="${x2}" y2="${y2}" stroke="black" />\n`;
	} else {
		leftOverCoords.set(regOut, [x + 20, y - 5]);
	}
	const otherReg = reg === regA ? regB : regA;
	if (leftOverCoords.has(otherReg)) {
		const [x2, y2] = leftOverCoords.get(otherReg)!;
		outSvg += `<line class="l13" x1="${x2 + 10}" y1="${y2 - 5}" x2="${x + 20}" y2="${y}" stroke="black" />\n`;
	} else {
		if (!pendingInputs.has(otherReg)) pendingInputs.set(otherReg, new Set());
		pendingInputs.get(otherReg)!.add([x + 20, y]);
	}
}

for (const [regOut, [regA, regB]] of ha2Xors) {
	const reg = leftOverCoords.has(regA) ? regA : regB;
	const coords = leftOverCoords.get(reg);
	if (!coords) {
		console.log("Missing coords for ha2And", regOut, regA, regB);
		continue;
	}
	const [x, y] = coords;
	outSvg += `<rect id="out_${regOut}" title="${regOut}" x="${x + 20}" y="${y + 5}" width="10" height="10" fill="blue" />\n`;
	outSvg += `<line class="l8" id="${reg}" x1="${x}" y1="${y}" x2="${x + 20}" y2="${y + 10}" stroke="black" />\n`;
	if (regOut.startsWith("z")) {
		const [x2, y2] = outputPos(regOut);
		outSvg += `<line class="l9" id="${regOut}" x1="${x + 30}" y1="${y + 10}" x2="${x2}" y2="${y2}" stroke="black" />\n`;
	} else {
		leftOverCoords.set(regOut, [x + 20, y + 5]);
	}
	const otherReg = reg === regA ? regB : regA;
	if (leftOverCoords.has(otherReg)) {
		const [x2, y2] = leftOverCoords.get(otherReg)!;
		outSvg += `<line class="l14" id="${otherReg}" x1="${x2 + 10}" y1="${y2 - 5}" x2="${x + 20}" y2="${y}" stroke="black" />\n`;
	} else {
		if (!pendingInputs.has(otherReg)) pendingInputs.set(otherReg, new Set());
		pendingInputs.get(otherReg)!.add([x + 20, y + 10]);
	}
}

for (const [regOut, [regA, regB]] of ors) {
	let coords: undefined | [number, number] = undefined;
	let reg: string;
	if (leftOverCoords.has(regA) && leftOverCoords.has(regB)) {
		const b = [[leftOverCoords.get(regA)!, regA] as const, [leftOverCoords.get(regB)!, regB] as const].sort(
			(a, b) => a[0][1] - b[0][1],
		)[0];
		reg = b[1];
		coords = b[0];
	} else if (leftOverCoords.has(regA)) {
		coords = leftOverCoords.get(regA);
		reg = regA;
	} else {
		coords = leftOverCoords.get(regB);
		reg = regB;
	}
	if (!coords) {
		console.log("Missing coords for or", regOut, regA, regB);
		continue;
	}

	const [x, y] = coords;
	outSvg += `<rect id="out_${regOut}" title="${regOut}" x="${120}" y="${y - 5}" width="10" height="10" fill="green" />\n`;
	outSvg += `<line class="l10" id="${reg}" x1="${x}" y1="${y - 5}" x2="${120}" y2="${y}" stroke="black" />\n`;
	if (regOut.startsWith("z")) {
		const [x2, y2] = outputPos(regOut);
		outSvg += `<line class="l11" x1="${130}" y1="${y}" x2="${x2}" y2="${y2}" stroke="black" />\n`;
	}

	const otherReg = reg === regA ? regB : regA;
	if (leftOverCoords.has(otherReg)) {
		const [x2, y2] = leftOverCoords.get(otherReg)!;
		outSvg += `<line class="l12" id="${otherReg}" x1="${x2 + 10}" y1="${y2 + 5}" x2="${120}" y2="${y}" stroke="black" />\n`;
	}

	const myPendingInputs = pendingInputs.get(regOut);
	if (myPendingInputs !== undefined) {
		for (const [px, py] of myPendingInputs) {
			outSvg += `<line class="l15" x1="${130}" y1="${y}"  x2="${px}" y2="${py}" stroke="black" />\n`;
		}
	}
}

writeFile("out.svg", outSvg + "</svg>", { encoding: "utf-8" }, () => {});

function inputPos(name: string, right: boolean): [number, number] {
	const start = name.startsWith("x") ? 0 : 30;
	const num = parseInt(name.slice(1));
	return [right ? 30 : 5, 20 + start + num * 60];
}

function outputPos(name: string): [number, number] {
	const num = parseInt(name.slice(1));
	return [170, 20 + num * 60];
}
