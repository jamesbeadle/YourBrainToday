import type { BrainTypeDefinition } from './knowledgeTypes';

export const domainBrainTypes: BrainTypeDefinition[] = [
	{
		type: 'ontology',
		category: 'domain',
		label: 'Ontology / Schema',
		tagline: 'Node types, properties, relations',
		description:
			'Define the kinds of things your knowledge contains — their properties, how they relate, and what constraints hold. The recommended starting point for structured knowledge.',
		editor: 'schema',
		defaultPipeline: 'graph_traversal',
		isRecommended: true
	},
	{
		type: 'ddd_model',
		category: 'domain',
		label: 'DDD Model',
		tagline: 'Bounded contexts, entities, ubiquitous language',
		description:
			'The modeller-maintained domain model: upload documents and an agent keeps bounded contexts, entities, value objects, aggregates, services, and a glossary in your own vocabulary.',
		editor: 'ddd_link',
		defaultPipeline: 'wiki_read',
		isRecommended: false
	},
	{
		type: 'taxonomy',
		category: 'domain',
		label: 'Taxonomy + Relations',
		tagline: 'Hierarchical classification with a link vocabulary',
		description:
			'A tree of categories plus a controlled vocabulary of relation names, so everything filed against it lands in a known place with known connections.',
		editor: 'taxonomy',
		defaultPipeline: 'graph_traversal',
		isRecommended: false
	},
	{
		type: 'rules',
		category: 'domain',
		label: 'Rules & Constraints',
		tagline: 'Validation, inference, policy',
		description:
			'Statements about what must hold, what follows from what, and what policy applies — kept separately from the data they govern.',
		editor: 'rules',
		defaultPipeline: 'structured_query',
		isRecommended: false
	},
	{
		type: 'event_schema',
		category: 'domain',
		label: 'Event / Fact Schema',
		tagline: 'Event types, transitions, temporal validity',
		description:
			'Define the kinds of events and facts your instances will record: what states exist, which transitions are legal, and how long a fact stays true.',
		editor: 'event_schema',
		defaultPipeline: 'temporal_graph_traversal',
		isRecommended: false
	},
	{
		type: 'process',
		category: 'domain',
		label: 'Process / Workflow',
		tagline: 'Stages, transitions, responsibilities',
		description:
			'Model how work moves: the stages a thing passes through, who is responsible at each one, and what moves it forward.',
		editor: 'process',
		defaultPipeline: 'structured_query',
		isRecommended: false
	},
	{
		type: 'hybrid_pack',
		category: 'domain',
		label: 'Hybrid Domain Pack',
		tagline: 'Core types + key relations + a few rules',
		description:
			'A lightweight starter combining the essentials of a schema with a handful of rules — enough structure to guide instances without modelling everything first.',
		editor: 'hybrid_pack',
		defaultPipeline: 'graph_traversal',
		isRecommended: false
	}
];
