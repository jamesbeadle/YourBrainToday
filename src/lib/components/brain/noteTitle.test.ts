import { describe, expect, it } from 'vitest';
import { noteTitleFor } from './noteTitle';

describe('noteTitleFor', () => {
	it('names a note after its first line', () => {
		const note = '  Boiler job at Mill Lane\nPriya says the second fitter starts Monday.';
		expect(noteTitleFor(note)).toBe('Boiler job at Mill Lane');
	});

	it('shortens a long first line so the source list stays readable', () => {
		const dictatedSentence =
			'Spoke to Priya this morning about the Mill Lane boiler job running two days over';
		const title = noteTitleFor(dictatedSentence);
		expect(title).toBe('Spoke to Priya this morning about the Mill Lane boiler job…');
	});

	it('cuts a single unbroken word at the limit', () => {
		const unbrokenWord = 'x'.repeat(80);
		expect(noteTitleFor(unbrokenWord)).toBe(`${'x'.repeat(60)}…`);
	});

	it('falls back to a plain name when the note is blank', () => {
		expect(noteTitleFor('   \n  ')).toBe('Note');
	});
});
