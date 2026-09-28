import { describe, expect, it } from 'vitest';
import { comparableWording, readTheSame } from './comparableWording';

describe('comparableWording', () => {
	it('ignores case, spacing and trailing punctuation', () => {
		expect(comparableWording('  Who signs   off a variation?! ')).toBe('who signs off a variation');
	});

	it('tells a repeat from a different question', () => {
		expect(readTheSame('Who signs off a variation?', 'who signs off a variation')).toBe(true);
		expect(readTheSame('Who signs off a variation?', 'Who signs off an invoice?')).toBe(false);
	});
});
