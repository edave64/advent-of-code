import { compile } from "./compiler";
import { readProgram } from "./shared";

const { a, b, c, program } = await readProgram(import.meta.url + "/input.txt");

const func = compile(program);
const ret = Array.from(func(a, b, c));

console.log(ret.join(","));
