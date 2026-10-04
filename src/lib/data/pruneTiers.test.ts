import { describe, expect, it } from 'vitest';
import { isPruneTierKey, pruneTiers } from './pruneTiers';
import { creditsPerBrainPrune, questionFloorCreditsFor } from './creditPricing';
import { mostCapableModelId } from './modelLadder';

describe('pruneTiers', () => {
	it('prices the standard pass at the prune price on the owner’s own model', () => {
		expect(pruneTiers.standard.pinnedModelId).toBeNull();
		expect(pruneTiers.standard.reserveCredits).toBe(creditsPerBrainPrune);
	});

	it('pins the advanced pass to the most capable rung and reserves its floor', () => {
		expect(pruneTiers.advanced.pinnedModelId).toBe(mostCapableModelId);
		expect(pruneTiers.advanced.reserveCredits).toBe(questionFloorCreditsFor(mostCapableModelId));
		expect(pruneTiers.advanced.reserveCredits).toBeGreaterThan(pruneTiers.standard.reserveCredits);
	});

	it('lets the advanced pass read more of the model before deciding', () => {
		expect(pruneTiers.advanced.readRounds).toBeGreaterThan(pruneTiers.standard.readRounds);
	});

	it('recognises only the named tiers', () => {
		expect(isPruneTierKey('standard')).toBe(true);
		expect(isPruneTierKey('advanced')).toBe(true);
		expect(isPruneTierKey('premium')).toBe(false);
		expect(isPruneTierKey(undefined)).toBe(false);
	});
});
