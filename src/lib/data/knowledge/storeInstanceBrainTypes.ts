import type { BrainTypeDefinition } from './knowledgeTypes';

export const storeInstanceBrainTypes: BrainTypeDefinition[] = [
	{
		type: 'episodic_log',
		category: 'instance',
		label: 'Episodic Log',
		tagline: 'Timestamped captures with provenance',
		description:
			'A raw record of what happened and where it came from — meetings, observations, decisions — kept in order, never rewritten.',
		editor: 'event_log',
		defaultPipeline: 'temporal_graph_traversal',
		isRecommended: false
	},
	{
		type: 'temporal_graph',
		category: 'instance',
		label: 'Temporal Knowledge Graph',
		tagline: 'Entities and facts that know when they were true',
		description:
			'Entities connected by facts carrying validity windows, so the graph can answer both what is true and what was true at any point.',
		editor: 'temporal_graph',
		defaultPipeline: 'temporal_graph_traversal',
		isRecommended: false
	},
	{
		type: 'hybrid_graph_vector',
		category: 'instance',
		label: 'Hybrid Graph + Vector',
		tagline: 'Chunks and embeddings beside extracted entities',
		description:
			'Semantic chunks for similarity search, with entities and relations extracted alongside — the best of both retrieval worlds.',
		editor: 'graph_vector',
		defaultPipeline: 'hybrid_graph_vector',
		isRecommended: false
	},
	{
		type: 'typed_records',
		category: 'instance',
		label: 'Typed Records',
		tagline: 'Structured instances of your expertise brain types',
		description:
			'Concrete records that conform to the node types a bound expertise brain defines — forms generated from the schema, data validated by it.',
		editor: 'records',
		defaultPipeline: 'structured_query',
		isRecommended: false
	},
	{
		type: 'vector_store',
		category: 'instance',
		label: 'Vector Chunk Store',
		tagline: 'Pure semantic search storage',
		description:
			'Chunks tuned for embedding and nothing else — the simplest possible store when similarity search is all you need.',
		editor: 'chunk_store',
		defaultPipeline: 'vector',
		isRecommended: false
	}
];
