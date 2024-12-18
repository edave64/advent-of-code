import { aStar, readData } from "./shared";

const { map, width } = await readData(import.meta.dirname + "/input.txt", false);

const path = aStar(0, map!.length - 1, map!, width);
console.log(`Steps: ${path!.length - 1}`);
