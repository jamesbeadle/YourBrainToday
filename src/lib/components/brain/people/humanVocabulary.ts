import type { ConstellationVocabulary } from '../constellation/constellationVocabulary';

export const humanVocabulary: ConstellationVocabulary = {
	describeNeuron: () => 'Person',
	describeNucleus: () => 'Organisation',
	hasKindKey: false,
	emptyHint:
		'Nobody here yet — name people in the interview or upload a document that mentions them.'
};
