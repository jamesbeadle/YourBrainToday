import { rungFor } from './modelLadder';

export type ModelEffort = 'low' | 'medium' | 'high' | 'xhigh' | 'max';

export type ModelTraits = {
	effort: ModelEffort | null;
	canForceToolUse: boolean;
	thinkingHeadroomTokens: number;
};

const alwaysThinkingHeadroomTokens = 8000;

const plainTraits: ModelTraits = {
	effort: null,
	canForceToolUse: true,
	thinkingHeadroomTokens: 0
};

/**
 * Opus 5.5 and Fable 5.1 always think, and refuse a forced tool choice with a
 * 400; the thinking spends from max_tokens, so each request is given headroom
 * for it on top of what the answer itself needs.
 */
const traitsByRung: Record<string, ModelTraits> = {
	'claude-opus-5-5': {
		effort: 'medium',
		canForceToolUse: false,
		thinkingHeadroomTokens: alwaysThinkingHeadroomTokens
	},
	'claude-fable-5-1': {
		effort: null,
		canForceToolUse: false,
		thinkingHeadroomTokens: alwaysThinkingHeadroomTokens
	}
};

export function traitsFor(modelId: string): ModelTraits {
	return traitsByRung[rungFor(modelId).modelId] ?? plainTraits;
}
