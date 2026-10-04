import { brainPruneReserveCreditsFor, creditsPerBrainPrune } from './creditPricing';
import { mostCapableModelId, rungFor } from './modelLadder';

export type PruneTierKey = 'standard' | 'advanced';

export type PruneTier = {
	key: PruneTierKey;
	title: string;
	pinnedModelId: string | null;
	readRounds: number;
	reserveCredits: number;
	spendReason: string;
};

const standardReadRounds = 3;
const advancedReadRounds = 6;
const advancedModelName = rungFor(mostCapableModelId).name;

export const pruneTiers: Record<PruneTierKey, PruneTier> = {
	standard: {
		key: 'standard',
		title: 'Prune knowledge',
		pinnedModelId: null,
		readRounds: standardReadRounds,
		reserveCredits: creditsPerBrainPrune,
		spendReason: 'brain_prune'
	},
	advanced: {
		key: 'advanced',
		title: `Prune with Claude ${advancedModelName}`,
		pinnedModelId: mostCapableModelId,
		readRounds: advancedReadRounds,
		reserveCredits: brainPruneReserveCreditsFor(mostCapableModelId),
		spendReason: 'brain_prune_advanced'
	}
};

export const defaultPruneTierKey: PruneTierKey = 'standard';

export function isPruneTierKey(candidate: unknown): candidate is PruneTierKey {
	return typeof candidate === 'string' && candidate in pruneTiers;
}
