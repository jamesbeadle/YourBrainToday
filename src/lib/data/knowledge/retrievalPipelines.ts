import type { RetrievalPipeline } from './knowledgeTypes';

export type RetrievalPipelineDefinition = {
	pipeline: RetrievalPipeline;
	label: string;
	summary: string;
};

export const retrievalPipelines: RetrievalPipelineDefinition[] = [
	{
		pipeline: 'vector',
		label: 'Vector similarity',
		summary: 'Embed the query, return the closest chunks.'
	},
	{
		pipeline: 'hybrid_graph_vector',
		label: 'Hybrid graph + vector',
		summary: 'Similarity search seeded, then expanded through entity links.'
	},
	{
		pipeline: 'temporal_graph_traversal',
		label: 'Temporal graph traversal',
		summary: 'Walk facts valid at the asked-about time, newest first.'
	},
	{
		pipeline: 'graph_traversal',
		label: 'Graph traversal',
		summary: 'Follow typed relations outward from matched nodes.'
	},
	{
		pipeline: 'structured_query',
		label: 'Structured query',
		summary: 'Filter typed records and rules by their fields.'
	},
	{
		pipeline: 'wiki_read',
		label: 'Index then read',
		summary: 'Consult the page index, then read the pages that matter.'
	}
];

export function findRetrievalPipeline(pipeline: string): RetrievalPipelineDefinition | null {
	return retrievalPipelines.find((definition) => definition.pipeline === pipeline) ?? null;
}
