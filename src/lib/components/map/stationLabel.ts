export const labelLineHeight = 13;

const singleLineCharacterLimit = 12;

export function stationLabelLines(name: string): string[] {
	if (name.length <= singleLineCharacterLimit) return [name];
	return balancedSplit(name.split(' '));
}

export function labelBaseline(stationY: number, offsetY: number, lineCount: number): number {
	const growsUpward = offsetY < 0;
	if (growsUpward) return stationY + offsetY - (lineCount - 1) * labelLineHeight;
	return stationY + offsetY;
}

function balancedSplit(words: string[]): string[] {
	if (words.length === 1) return words;
	const halfLength = words.join(' ').length / 2;
	const firstLine: string[] = [];
	let firstLineLength = 0;
	for (const word of words) {
		const wouldPassHalfway = firstLineLength + word.length / 2 >= halfLength;
		if (wouldPassHalfway && firstLine.length > 0) break;
		firstLine.push(word);
		firstLineLength += word.length + 1;
	}
	const secondLine = words.slice(firstLine.length);
	if (secondLine.length === 0) return [firstLine.join(' ')];
	return [firstLine.join(' '), secondLine.join(' ')];
}
