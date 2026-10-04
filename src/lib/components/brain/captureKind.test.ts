import { describe, expect, it } from 'vitest';
import { recogniseCapture } from './captureKind';

describe('recogniseCapture', () => {
	it('sees nothing in a blank capture', () => {
		expect(recogniseCapture('  \n ')).toBe('nothing');
	});

	it('reads a link pasted on its own as a link', () => {
		expect(recogniseCapture(' https://x.com/someone/status/1234 \n')).toBe('link');
		expect(recogniseCapture('http://github.com/acme/ledger')).toBe('link');
	});

	it('keeps a forwarded message that mentions a link as a note', () => {
		const forwarded = 'Boss says read this: https://x.com/someone/status/1234';
		expect(recogniseCapture(forwarded)).toBe('note');
	});

	it('keeps plain text as a note', () => {
		expect(recogniseCapture('Priya says the second fitter starts Monday.')).toBe('note');
	});
});
