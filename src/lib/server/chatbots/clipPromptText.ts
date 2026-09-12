const ellipsis = '…';

export function clipPromptText(text: string, longest: number): string {
	const flattened = text.replace(/\s+/g, ' ').trim();
	if (flattened.length <= longest) return flattened;
	return `${flattened.slice(0, longest - ellipsis.length).trimEnd()}${ellipsis}`;
}

export function clipPromptSection(section: string, longest: number, truncationNote: string): string {
	if (section.length <= longest) return section;
	return `${section.slice(0, longest).trimEnd()}\n\n${truncationNote}`;
}
