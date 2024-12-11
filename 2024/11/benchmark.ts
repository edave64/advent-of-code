import { bench, run } from "mitata";
import { solve as solvePart1 } from "./part01/solution.ts";
import { solve as solvePart2 } from "./part02/solution.ts";

bench("part1", solvePart1);
bench("part2", solvePart2);

await run();
