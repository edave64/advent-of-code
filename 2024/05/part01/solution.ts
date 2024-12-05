import { isValidPageSet, loadData } from "../shared";

const { dependencies, pageSets } = await loadData(import.meta.dirname + "/../input.txt");

let sum = 0;

for (const pageSet of pageSets) {
	if (isValidPageSet(pageSet, dependencies)) {
		sum += pageSet[Math.ceil(pageSet.length / 2) - 1];
	}
}

console.log(sum);
