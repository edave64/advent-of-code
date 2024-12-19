export function readPatternMap(str: string): Map<string, string[]> {
	const allPatterns = str.split(", ").sort((a, b) => {
		const firstSort = b.charCodeAt(0) - a.charCodeAt(0);
		if (firstSort !== 0) return firstSort;
		return b.length - a.length;
	});
	const patterns = new Map<string, string[]>();
	for (const pattern of allPatterns) {
		if (!patterns.has(pattern[0])) {
			patterns.set(pattern[0], []);
		}
		patterns.get(pattern[0])!.push(pattern);
	}
	return patterns;
}
