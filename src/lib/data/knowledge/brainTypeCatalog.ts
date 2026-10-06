import { domainBrainTypes } from './domainBrainTypes';
import { humanBrainTypes } from './humanBrainTypes';
import { instanceBrainTypes } from './instanceBrainTypes';
import { kindForCategory } from './knowledgeKinds';
import type {
	BrainCategory,
	BrainType,
	BrainTypeDefinition,
	RetrievalConfig
} from './knowledgeTypes';

export const brainTypeCatalog: BrainTypeDefinition[] = [
	...domainBrainTypes,
	...instanceBrainTypes,
	...humanBrainTypes
];

export const categoryAccents: Record<BrainCategory, string> = {
	domain: kindForCategory('domain').accent,
	instance: kindForCategory('instance').accent,
	people: kindForCategory('people').accent
};

export const categoryLabels: Record<BrainCategory, string> = {
	domain: 'Expertise Brain',
	instance: 'Experience Brain',
	people: 'Human Brain'
};

export function findBrainType(type: string): BrainTypeDefinition | null {
	return brainTypeCatalog.find((definition) => definition.type === type) ?? null;
}

export function defaultRetrievalConfigFor(type: BrainType): RetrievalConfig {
	const definition = findBrainType(type);
	return {
		pipeline: definition?.defaultPipeline ?? 'vector',
		topK: 8,
		traversalDepth: 2,
		recencyWeight: 0.3
	};
}
