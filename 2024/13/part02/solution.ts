import { readMachines, solve } from "../part01/solution";

let sum = 0;

for await (const { ax, ay, bx, by, prizeX, prizeY } of readMachines(import.meta.dirname + "/../input.txt")) {
	sum += solve(ax, ay, bx, by, prizeX + 10000000000000, prizeY + 10000000000000);
}
console.log(sum);
