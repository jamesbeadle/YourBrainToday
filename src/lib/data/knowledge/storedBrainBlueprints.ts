import type { KnowledgeKind } from './knowledgeKinds';
import type { BrainCategory, BrainType } from './knowledgeTypes';

/** Every kind but process is stored as a kb_brain; process brains live as workflows. */
export type StoredKind = Exclude<KnowledgeKind, 'process'>;

export const storedBrainBlueprints: Record<
	StoredKind,
	{ category: BrainCategory; brainType: BrainType }
> = {
	expertise: { category: 'domain', brainType: 'ddd_model' },
	experience: { category: 'instance', brainType: 'episodic_log' },
	human: { category: 'people', brainType: 'people_graph' }
};
