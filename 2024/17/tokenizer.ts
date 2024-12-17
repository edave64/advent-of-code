export function* tokenize(str: string): Generator<Token> {
	if (str.length % 4 !== 3) {
		throw new Error("Invalid number of instructions");
	}
	for (let i = 0; i < str.length; i += 4) {
		const opcode = parseInt(str[i]);
		const operand = parseInt(str[i + 2]);

		if (isNaN(operand) || operand > 7) {
			throw new Error(`Invalid operand ${str[i + 2]}`);
		}

		switch (opcode) {
			case TokenType.adv:
			case TokenType.bst:
			case TokenType.out:
			case TokenType.bdv:
			case TokenType.cdv:
				yield { type: opcode, value: comboOperand(operand) };
				break;
			case TokenType.bxl:
			case TokenType.jnz:
			case TokenType.bxc:
				yield { type: opcode, value: operand };
				break;
			default:
				throw new Error(`Invalid opcode ${opcode}`);
		}
	}
}

function comboOperand(num: number): Token["value"] {
	switch (num) {
		case 4:
			return "a";
		case 5:
			return "b";
		case 6:
			return "c";
		case 7:
			throw new Error("Invalid combo operand");
		default:
			return num;
	}
}

export enum TokenType {
	adv = 0,
	bxl,
	bst,
	jnz,
	bxc,
	out,
	bdv,
	cdv,
}

export interface Token {
	type: TokenType;
	value: number | "a" | "b" | "c";
}
