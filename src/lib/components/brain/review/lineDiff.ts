export type DiffLine = { kind: 'same' | 'added' | 'removed'; text: string };

const LINE_LIMIT = 400;

export function lineDiff(beforeText: string, afterText: string): DiffLine[] {
	const before = beforeText.split('\n').slice(0, LINE_LIMIT);
	const after = afterText.split('\n').slice(0, LINE_LIMIT);
	const common = longestCommonLengths(before, after);
	return walkBack(before, after, common);
}

function longestCommonLengths(before: string[], after: string[]): Int32Array {
	const width = after.length + 1;
	const lengths = new Int32Array((before.length + 1) * width);
	for (let beforeIndex = before.length - 1; beforeIndex >= 0; beforeIndex -= 1) {
		for (let afterIndex = after.length - 1; afterIndex >= 0; afterIndex -= 1) {
			const here = beforeIndex * width + afterIndex;
			lengths[here] =
				before[beforeIndex] === after[afterIndex]
					? lengths[here + width + 1] + 1
					: Math.max(lengths[here + 1], lengths[here + width]);
		}
	}
	return lengths;
}

function walkBack(before: string[], after: string[], lengths: Int32Array): DiffLine[] {
	const width = after.length + 1;
	const lines: DiffLine[] = [];
	let beforeIndex = 0;
	let afterIndex = 0;
	while (beforeIndex < before.length && afterIndex < after.length) {
		if (before[beforeIndex] === after[afterIndex]) {
			lines.push({ kind: 'same', text: before[beforeIndex] });
			beforeIndex += 1;
			afterIndex += 1;
			continue;
		}
		const skipBefore = lengths[(beforeIndex + 1) * width + afterIndex];
		const skipAfter = lengths[beforeIndex * width + afterIndex + 1];
		if (skipBefore >= skipAfter) {
			lines.push({ kind: 'removed', text: before[beforeIndex] });
			beforeIndex += 1;
			continue;
		}
		lines.push({ kind: 'added', text: after[afterIndex] });
		afterIndex += 1;
	}
	while (beforeIndex < before.length) lines.push({ kind: 'removed', text: before[beforeIndex++] });
	while (afterIndex < after.length) lines.push({ kind: 'added', text: after[afterIndex++] });
	return lines;
}
