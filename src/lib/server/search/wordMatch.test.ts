import { describe, expect, it } from 'vitest';
import { matchingAnyOf, wordsOf } from './wordMatch';

describe('wordsOf', () => {
	it('keeps the words long enough to mean something and drops the symbols around them', () => {
		expect(wordsOf('the "Xero" sync, again!')).toEqual(['the', 'Xero', 'sync', 'again']);
	});

	it('drops one and two letter words', () => {
		expect(wordsOf('a QS on it')).toEqual([]);
	});

	it('is empty for an empty phrase', () => {
		expect(wordsOf('   ')).toEqual([]);
	});
});

describe('matchingAnyOf', () => {
	it('spells a PostgREST or-filter across the columns', () => {
		expect(matchingAnyOf(['title', 'measure'], 'Xero')).toBe('title.ilike.%Xero%,measure.ilike.%Xero%');
	});
});
