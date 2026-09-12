const shortestUsefulWord = 3;

export function wordsOf(phrase: string): string[] {
	return phrase
		.split(/\s+/)
		.map(stripSymbols)
		.filter((word) => word.length >= shortestUsefulWord);
}

export function matchingAnyOf(columns: string[], word: string): string {
	return columns.map((column) => `${column}.ilike.%${word}%`).join(',');
}

function stripSymbols(word: string): string {
	return word.replace(/[^\p{L}\p{N}]/gu, '');
}
