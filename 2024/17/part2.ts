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

The output we are trying to archive is 2,4,1,3,7,5,0,3,4,3,1,5,5,5,3,0,
so we should walk backwards, from the last value to the first
 */

// NOT FUNCTIONAL

const values = [2, 4, 1, 3, 7, 5, 0, 3, 4, 3, 1, 5, 5, 5, 3, 0];
let iters = 0;
function resolve(values: number[], idx: number, aReq: number, aMask: number): bigint | null {
	iters++;
	if (idx < 0) return 0n;
	let b = values[idx];
	idx++;
	b = b ^ 0b101;
	const localAMask = aMask & 0b111;
	const localAReq = aReq & localAMask;
	aMask >>= 3;
	aReq >>= 3;
	for (let c = 0; c <= 0b111; c++) {
		b = b ^ c;
		c = c << b;
		const cMask = 0b111 << b;
		b = b ^ 0b011;

		if (localAReq !== (b & localAMask)) {
			continue;
		}
		const nextAMask = aMask | cMask;
		const nextAReq = aReq | c;

		const a = resolve(values, idx, nextAReq, nextAMask);
		if (a !== null) {
			return (a << 3n) | BigInt(b);
		}
	}
	return null;
}

console.log(resolve(values, 0, 0, 0));
console.log(iters);
