import { domainBlockLabels } from '$lib/data/domainBlocks';
import type { BrainContext, BrainPageSummary } from '$lib/data/brainModelTypes';

/** The words a constellation uses for what its neurons and nuclei stand for. */
export type ConstellationVocabulary = {
	describeNeuron: (page: BrainPageSummary) => string;
	describeNucleus: (context: BrainContext) => string;
	hasKindKey: boolean;
	emptyHint: string;
};

export const expertiseVocabulary: ConstellationVocabulary = {
	describeNeuron: (page) => domainBlockLabels[page.kind].singular,
	describeNucleus: (context) =>
		context.isCoreDomain ? 'Bounded context · Core domain' : 'Bounded context',
	hasKindKey: true,
	emptyHint: 'No neurons yet — add your first document and watch the constellation grow.'
};
