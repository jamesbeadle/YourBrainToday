import { describe, expect, it } from 'vitest';
import { speakerTurnsText } from './speakerTurnsText';

describe('speakerTurnsText', () => {
	it('leaves out speaker labels when only one person spoke', () => {
		const segments = [
			{ speaker: 'A', text: ' The boiler job overran. ' },
			{ speaker: 'A', text: 'We need a second fitter.' }
		];
		expect(speakerTurnsText(segments)).toBe('The boiler job overran. We need a second fitter.');
	});

	it('labels each turn and joins consecutive segments from the same speaker', () => {
		const segments = [
			{ speaker: 'A', text: 'Who is on site tomorrow?' },
			{ speaker: 'B', text: 'Priya is.' },
			{ speaker: 'B', text: 'She has the keys.' },
			{ speaker: 'A', text: 'Good.' }
		];
		expect(speakerTurnsText(segments)).toBe(
			'Speaker A: Who is on site tomorrow?\n\n' +
				'Speaker B: Priya is. She has the keys.\n\n' +
				'Speaker A: Good.'
		);
	});

	it('skips segments with no words in them', () => {
		const segments = [
			{ speaker: 'A', text: 'Hello.' },
			{ speaker: 'B', text: '   ' },
			{ speaker: 'A', text: 'Anyone there?' }
		];
		expect(speakerTurnsText(segments)).toBe('Hello. Anyone there?');
	});

	it('is empty when nothing was said', () => {
		expect(speakerTurnsText([])).toBe('');
	});
});
