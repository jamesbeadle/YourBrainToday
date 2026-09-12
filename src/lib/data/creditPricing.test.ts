import { describe, expect, it } from 'vitest';
import {
	costMarkup,
	creditValuePence,
	ingestCreditsFor,
	questionCreditsFor,
	questionFloorCreditsFor,
	usageCostPence,
	usdToGbp
} from './creditPricing';
import { emptyUsage } from './anthropicUsage';

const haiku = 'claude-haiku-4-5';
const oneMillionTokens = 1_000_000;
const penceInPound = 100;
const haikuInputUsdPerMillion = 1;
const haikuOutputUsdPerMillion = 5;

describe('usageCostPence', () => {
	it('bills input and output tokens at the rung rate in pence', () => {
		const usage = { ...emptyUsage, inputTokens: oneMillionTokens, outputTokens: oneMillionTokens };
		const expectedUsd = haikuInputUsdPerMillion + haikuOutputUsdPerMillion;
		expect(usageCostPence(haiku, usage)).toBeCloseTo(expectedUsd * usdToGbp * penceInPound);
	});

	it('bills cache reads at a tenth of input and cache writes at a quarter more', () => {
		const inputOnly = usageCostPence(haiku, { ...emptyUsage, inputTokens: oneMillionTokens });
		const cacheRead = usageCostPence(haiku, { ...emptyUsage, cacheReadTokens: oneMillionTokens });
		const cacheWrite = usageCostPence(haiku, { ...emptyUsage, cacheWriteTokens: oneMillionTokens });
		expect(cacheRead).toBeCloseTo(inputOnly * 0.1);
		expect(cacheWrite).toBeCloseTo(inputOnly * 1.25);
	});

	it('costs nothing when nothing was used', () => {
		expect(usageCostPence(haiku, emptyUsage)).toBe(0);
	});
});

describe('questionCreditsFor', () => {
	it('owes nothing when no calls were made', () => {
		expect(questionCreditsFor([])).toBe(0);
	});

	it('never charges less than the rung floor', () => {
		const tinyUsage = { ...emptyUsage, inputTokens: 10, outputTokens: 10 };
		expect(questionCreditsFor([{ modelId: haiku, usage: tinyUsage }])).toBe(
			questionFloorCreditsFor(haiku)
		);
	});

	it('charges the marked-up bill in credits once it exceeds the floor', () => {
		const heavyUsage = { ...emptyUsage, inputTokens: oneMillionTokens };
		const billPence = usageCostPence(haiku, heavyUsage);
		const markedUpCredits = Math.ceil((billPence * costMarkup) / creditValuePence);
		expect(markedUpCredits).toBeGreaterThan(questionFloorCreditsFor(haiku));
		expect(questionCreditsFor([{ modelId: haiku, usage: heavyUsage }])).toBe(markedUpCredits);
	});

	it('sums the bill across every call before marking it up', () => {
		const heavyUsage = { ...emptyUsage, inputTokens: oneMillionTokens };
		const calls = [
			{ modelId: haiku, usage: heavyUsage },
			{ modelId: haiku, usage: heavyUsage }
		];
		const billPence = usageCostPence(haiku, heavyUsage) * calls.length;
		expect(questionCreditsFor(calls)).toBe(Math.ceil((billPence * costMarkup) / creditValuePence));
	});
});

describe('ingestCreditsFor', () => {
	it('charges the base rate up to the first block of bytes', () => {
		expect(ingestCreditsFor(0)).toBe(50);
		expect(ingestCreditsFor(25_000)).toBe(50);
	});

	it('adds a band for every started block beyond the first', () => {
		expect(ingestCreditsFor(25_001)).toBe(60);
		expect(ingestCreditsFor(50_000)).toBe(60);
		expect(ingestCreditsFor(50_001)).toBe(70);
	});
});
