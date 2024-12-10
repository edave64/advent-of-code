import { bench, run } from "mitata";
import { solve as solvePart1 } from "./part01/solution";
import { solve as solvePart2 } from "./part02/solution";
import { solve as solvePart2Floodfill } from "./part02/solution-floodfill";

bench("part1", solvePart1);
bench("part2", solvePart2);
bench("part2 - floodfill", solvePart2Floodfill);

await run();
