import { noteInstanceBrainTypes } from './noteInstanceBrainTypes';
import { storeInstanceBrainTypes } from './storeInstanceBrainTypes';
import type { BrainTypeDefinition } from './knowledgeTypes';

export const instanceBrainTypes: BrainTypeDefinition[] = [
	...noteInstanceBrainTypes,
	...storeInstanceBrainTypes
];
