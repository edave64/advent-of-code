import { isValidPageSet, loadData } from "../shared";

const { dependencies, pageSets } = await loadData(import.meta.dirname + "/../input.txt");

let sum = 0;

for (const pageSet of pageSets) {
	if (!isValidPageSet(pageSet, dependencies)) {
		const waiting: { pageNr: number; dependencies: Set<number> }[] = [];
		const allPages = new Set(pageSet);
		const visited = new Set<number>();
		const newPageSet: number[] = [];

		for (const page of pageSet) {
			const dependenciesForPage = dependencies.get(page);
			if (dependenciesForPage) {
				const validDependencies = dependenciesForPage.intersection(allPages);
				if (!validDependencies.isSubsetOf(visited)) {
					waiting.push({ pageNr: page, dependencies: validDependencies });
				} else {
					addToNewPageSet(page);
				}
			}
		}

		if (waiting.length !== 0) {
			throw new Error("Not all dependencies have been satisfied, should be impossible");
		}
		sum += newPageSet[Math.ceil(newPageSet.length / 2) - 1];

		function addToNewPageSet(page: number) {
			newPageSet.push(page);
			visited.add(page);

			let addNext: number | null = null;
			for (let i = 0; i < waiting.length; ++i) {
				const waitingPage = waiting[i];
				if (waitingPage.dependencies.isSubsetOf(visited)) {
					waiting.splice(i, 1);
					addNext = waitingPage.pageNr;
					break;
				}
			}

			if (addNext !== null) {
				// Making this a tail call. If stack issues should arise, this can be easily
				// turned into a loop.
				addToNewPageSet(addNext);
			}
		}
	}
}

console.log(sum);
