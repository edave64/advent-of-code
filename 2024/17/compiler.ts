import { UnreachableCaseError } from "ts-essentials";
import { tokenize, TokenType } from "./tokenizer";

const GeneratorFunction = function* () {}.constructor as any;

export function compile(source: string): (a: number, b: number, c: number) => Generator<number> {
	let out: string[] = [];
	let noInbetweenJumps = true;
	let noJumps = true;
	for (const token of tokenize(source)) {
		switch (token.type) {
			case TokenType.adv:
			case TokenType.bdv:
			case TokenType.cdv:
				const reg = {
					[TokenType.adv]: "a",
					[TokenType.bdv]: "b",
					[TokenType.cdv]: "c",
				}[token.type];
				out.push(`${reg} = a >> ${token.value};`);
				break;
			case TokenType.bxl:
				out.push(`b = b ^ ${token.value};`);
				break;
			case TokenType.bst:
				out.push(`b = ${token.value} & 0b111;`);
				break;
			case TokenType.jnz:
				noJumps = false;
				noInbetweenJumps &&= token.value === 0;
				out.push(`if (a !== 0) { pc = ${(token.value as number) - 2}; continue; }`);
				break;
			case TokenType.bxc:
				out.push(`b = b ^ c;`);
				break;
			case TokenType.out:
				out.push(`yield ${token.value} & 0b111;`);
				break;
			default:
				throw new UnreachableCaseError(token.type);
		}
	}

	let outSource = "";

	if (noJumps) {
		outSource += `let pc = 0`;
	} else {
		outSource += `for (let pc = 0; pc < ${out.length * 2}; pc += 2) {\n`;
		if (!noInbetweenJumps) {
			outSource += `switch (pc) {\n`;
		}
	}
	// 6 is the last instruction that can be jumped to
	const lastInstr = Math.min(out.length - 2, 3);
	for (let i = 0; i < out.length; i++) {
		if (!noInbetweenJumps) {
			if (i < lastInstr) {
				outSource += `case ${i * 2}:`;
			} else if (i === lastInstr) {
				outSource += `default:`;
			}
		}
		outSource += `pc = ${i * 2}; ${out[i]}\n`;
	}
	if (!noInbetweenJumps) {
		outSource += `}\n`;
	}
	outSource += `pc = ${out.length * 2};\n`;
	if (!noJumps) {
		outSource += `}\n`;
	}

	return new GeneratorFunction("a", "b", "c", outSource);
}
