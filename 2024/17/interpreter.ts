import { UnreachableCaseError } from "ts-essentials";
import { tokenize, TokenType } from "./tokenizer";

export function interpret(source: string): (a: number, b: number, c: number) => Generator<number> {
	const tokens = Array.from(tokenize(source));
	return function* (a, b, c): Generator<number> {
		for (let pc = 0; pc < tokens.length; pc++) {
			const token = tokens[pc];
			const value = token.value;
			const normalizedValue = value === "a" ? a : value === "b" ? b : value === "c" ? c : value;
			switch (token.type) {
				case TokenType.adv:
					a = 0 | (a / Math.pow(2, normalizedValue));
					break;
				case TokenType.bdv:
					b = 0 | (a / Math.pow(2, normalizedValue));
					break;
				case TokenType.cdv:
					c = 0 | (a / Math.pow(2, normalizedValue));
					break;
				case TokenType.bxl:
					b = b ^ normalizedValue;
					break;
				case TokenType.bst:
					b = ((normalizedValue % 8) + 8) % 8;
					break;
				case TokenType.jnz:
					if (a !== 0) {
						pc = normalizedValue / 2 - 1;
					}
					continue;
				case TokenType.bxc:
					b = b ^ c;
					break;
				case TokenType.out:
					yield ((normalizedValue % 8) + 8) % 8;
					break;
				default:
					throw new UnreachableCaseError(token.type);
			}
		}
	};
}
