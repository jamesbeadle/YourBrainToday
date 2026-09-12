export type BrainCategory = 'domain' | 'instance';

export type DomainBrainType =
	| 'ontology'
	| 'ddd_model'
	| 'taxonomy'
	| 'rules'
	| 'event_schema'
	| 'process'
	| 'hybrid_pack';

export type InstanceBrainType =
	| 'atomic_notes' | 'outliner' | 'episodic_log' | 'temporal_graph' | 'hybrid_graph_vector'
	| 'typed_records' | 'llm_wiki' | 'journal' | 'vector_store';

export type BrainType = DomainBrainType | InstanceBrainType;

export type BrainEditorKind =
	| 'schema' | 'ddd_link' | 'taxonomy' | 'rules' | 'event_schema' | 'process' | 'hybrid_pack'
	| 'notes' | 'outliner' | 'event_log' | 'temporal_graph' | 'graph_vector' | 'records'
	| 'wiki' | 'journal' | 'chunk_store';

export type RetrievalPipeline =
	| 'vector'
	| 'hybrid_graph_vector'
	| 'temporal_graph_traversal'
	| 'graph_traversal'
	| 'structured_query'
	| 'wiki_read';

export type RetrievalConfig = {
	pipeline: RetrievalPipeline;
	topK: number;
	traversalDepth: number;
	recencyWeight: number;
};

export type BrainTypeDefinition = {
	type: BrainType;
	category: BrainCategory;
	label: string;
	tagline: string;
	description: string;
	editor: BrainEditorKind;
	defaultPipeline: RetrievalPipeline;
	isRecommended: boolean;
};

export type KnowledgeBaseSummary = {
	id: string;
	ownerId: string;
	name: string;
	description: string;
	isArchived: boolean;
	domainBrainCount: number;
	instanceBrainCount: number;
	updatedAt: string;
};

export type KbBrainSummary = {
	id: string;
	knowledgeBaseId: string;
	category: BrainCategory;
	brainType: BrainType;
	name: string;
	description: string;
	retrievalConfig: RetrievalConfig;
	domainBrainId: string | null;
	updatedAt: string;
};

export type KbBrainItem = {
	id: string;
	itemKind: string;
	title: string;
	body: string;
	data: Record<string, unknown>;
	parentItemId: string | null;
	position: number;
	occurredAt: string | null;
	validFrom: string | null;
	validTo: string | null;
	createdAt: string;
};
