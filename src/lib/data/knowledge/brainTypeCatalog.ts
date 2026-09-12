import { domainBrainTypes } from './domainBrainTypes';
import { instanceBrainTypes } from './instanceBrainTypes';
import { kindForCategory } from './knowledgeKinds';
import type {
	BrainCategory,
	BrainType,
	BrainTypeDefinition,
	RetrievalConfig
} from './knowledgeTypes';

export const brainTypeCatalog: BrainTypeDefinition[] = [...domainBrainTypes, ...instanceBrainTypes];

export const categoryAccents: Record<BrainCategory, string> = {
	domain: kindForCategory('domain').accent,
	instance: kindForCategory('instance').accent
};

export const categoryLabels: Record<BrainCategory, string> = {
	domain: 'Expertise Brain',
	instance: 'Experience Brain'
};

export function brainTypesFor(category: BrainCategory): BrainTypeDefinition[] {
	return brainTypeCatalog.filter((definition) => definition.category === category);
}

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
