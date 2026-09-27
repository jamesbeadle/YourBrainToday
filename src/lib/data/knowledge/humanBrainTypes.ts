import type { BrainTypeDefinition } from './knowledgeTypes';

export const humanBrainTypes: BrainTypeDefinition[] = [
	{
		type: 'people_graph',
		category: 'people',
		label: 'People Graph',
		tagline: 'People, and how well they get on',
		description:
			'Everyone around the business as a node, and every relationship between two of them as an edge that knows what it is and how warm it runs — so you know who to go through.',
		editor: 'people',
		defaultPipeline: 'graph_traversal',
		isRecommended: true
	}
];
