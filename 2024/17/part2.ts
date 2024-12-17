/**
Brute-forcing is futile on this problem. We have to think :(
The "decompiled" program looks something like this:
 
b = a & 0b111;
b = b ^ 3;
c = a >> b;
a = a >> 3;
b = b ^ c;
b = b ^ 5;
yield b & 0b111;
if (a !== 0) continue;
break;

This tells us:
- Every iteration shifts the value of a by 3 bits
- B and C depend on A
- A has to be 0 at the end of the program

The output we are trying to archive is 2,4,1,3,7,5,0,3,4,3,1,5,5,5,3,0
so we should walk backwards, from the last value to the first
 */

import { compile } from "./compiler";
import { readProgram } from "./shared";

const { b, c, program } = await readProgram(import.meta.dirname + "/input.txt");

const compiled = function* anonymous(a: bigint): Generator<number> {
	let b = 0n;
	let c = 0n;
	while (true) {
		b = a & 7n;
		b = b ^ 3n;
		c = a >> b;
		a = a >> 3n;
		b = b ^ c;
		b = b ^ 5n;
		yield Number(b & 7n);
		if (a === 0n) {
			break;
		}
	}
};

const values = [2, 4, 1, 3, 7, 5, 0, 3, 4, 3, 1, 5, 5, 5, 3, 0];

let depth = values.length - 1;
function solve(i: number, a: bigint): bigint | null {
	if (i < 0) {
		// Verify
		if (Array.from(compiled(a!)).join(",") !== program) {
			return null;
		}
		return a;
	}
	depth = Math.min(depth, i);
	for (let j = 0; j <= 0b1111; j++) {
		const newA = (a << 3n) | BigInt(j);
		const firstVal = compiled(newA).next().value;
		if (firstVal === values[i]) {
			const req = solve(i - 1, newA);
			if (req !== null) return req;
		}
	}
	return null;
}

const a = solve(values.length - 1, 0n);
console.log(a);
