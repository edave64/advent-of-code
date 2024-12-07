import { readFileLines } from "../shared";

export type DependencyMap = Map<number, Set<number>>;

enum State {
	OrderingRules,
	PageSet,
}

export async function loadData(path: string): Promise<{ dependencies: DependencyMap; pageSets: number[][] }> {
	const dependencies: DependencyMap = new Map();
	const pageSets: number[][] = [];
	let state = State.OrderingRules;

	for await (const line of readFileLines(path)) {
		if (line === "") {
			state = State.PageSet;
		} else if (state === State.OrderingRules) {
			loadRule(line, dependencies);
		} else {
			pageSets.push(line.split(",").map(Number));
		}
	}
	return { dependencies, pageSets };
}

function loadRule(str: string, dependencies: DependencyMap) {
	const [dependency, num] = str.split("|").map(Number);
	if (!dependencies.has(num)) {
		dependencies.set(num, new Set());
	}
	dependencies.get(num)!.add(dependency);
}

export function isValidPageSet(pageSet: number[], dependencies: DependencyMap): boolean {
	const allPages = new Set(pageSet);
	const alreadyPrinted = new Set<number>();

	for (const page of pageSet) {
		if (alreadyPrinted.has(page)) {
			throw new Error(`Page ${page} occurs multiple times in page set: ${pageSet.join(",")}`);
		}
		const dependenciesForPage = dependencies.get(page);
		if (dependenciesForPage) {
			const validDependencies = dependenciesForPage.intersection(allPages);
			if (!validDependencies.isSubsetOf(alreadyPrinted)) {
				// Dependencies are not satisfied, abort
				return false;
			}
		}
		alreadyPrinted.add(page);
	}

	return true;
}
