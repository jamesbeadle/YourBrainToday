const longestNoteTitle = 60;
const untitledNote = 'Note';
const ellipsis = '…';

export function noteTitleFor(noteText: string): string {
	const firstLine = firstLineOf(noteText);
	if (firstLine === '') return untitledNote;
	if (firstLine.length <= longestNoteTitle) return firstLine;
	return shortenedToWholeWords(firstLine);
}

function firstLineOf(noteText: string): string {
	const [firstLine] = noteText.trim().split('\n');
	return firstLine.trim();
}

function shortenedToWholeWords(line: string): string {
	const withinLimit = line.slice(0, longestNoteTitle + 1);
	const lastWordBreak = withinLimit.lastIndexOf(' ');
	if (lastWordBreak <= 0) return `${line.slice(0, longestNoteTitle)}${ellipsis}`;
	return `${withinLimit.slice(0, lastWordBreak)}${ellipsis}`;
}
