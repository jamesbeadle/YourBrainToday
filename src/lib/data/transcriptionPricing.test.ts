import { describe, expect, it } from 'vitest';
import { costMarkup, creditValuePence, usdToGbp } from './creditPricing';
import { transcriptionCreditsFor, transcriptionReserveCreditsFor } from './transcriptionPricing';

const oneHourInSeconds = 60 * 60;
const penceInPound = 100;
const usdPerMinute = 0.006;
const voiceMemoBytesPerSecond = 8_000;

describe('transcriptionCreditsFor', () => {
	it('charges the marked-up cost of the recording length', () => {
		const billPence = 60 * usdPerMinute * usdToGbp * penceInPound;
		const expected = Math.ceil((billPence * costMarkup) / creditValuePence);
		expect(transcriptionCreditsFor(oneHourInSeconds)).toBe(expected);
	});

	it('never charges less than one credit', () => {
		expect(transcriptionCreditsFor(0)).toBe(1);
		expect(transcriptionCreditsFor(1)).toBe(1);
	});

	it('charges a longer recording more', () => {
		expect(transcriptionCreditsFor(600)).toBeGreaterThan(transcriptionCreditsFor(60));
	});
});

describe('transcriptionReserveCreditsFor', () => {
	it('reserves for the length a voice memo of that size would run', () => {
		const tenMinuteMemoBytes = 600 * voiceMemoBytesPerSecond;
		const tenMinutesInSeconds = 600;
		const reserve = transcriptionReserveCreditsFor(tenMinuteMemoBytes);
		expect(reserve).toBe(transcriptionCreditsFor(tenMinutesInSeconds));
	});
});
