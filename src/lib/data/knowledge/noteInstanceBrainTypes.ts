import type { BrainTypeDefinition } from './knowledgeTypes';

export const noteInstanceBrainTypes: BrainTypeDefinition[] = [
	{
		type: 'atomic_notes',
		category: 'instance',
		label: 'Atomic Notes',
		tagline: 'Small linked notes, Zettelkasten style',
		description:
			'One idea per note, densely linked. The classic slip-box: capture fast, connect as you go, let structure emerge from the links.',
		editor: 'notes',
		defaultPipeline: 'hybrid_graph_vector',
		isRecommended: true
	},
	{
		type: 'outliner',
		category: 'instance',
		label: 'Block Outliner',
		tagline: 'Nested blocks with references',
		description:
			'Everything is a block in a tree. Indent to nest, reference any block from anywhere, and grow documents out of fragments.',
		editor: 'outliner',
		defaultPipeline: 'hybrid_graph_vector',
		isRecommended: false
	},
	{
		type: 'llm_wiki',
		category: 'instance',
		label: 'LLM Wiki',
		tagline: 'Agent-maintained interlinked pages',
		description:
			'An interlinked Markdown knowledge layer designed for an agent to keep current — pages that update rather than pile up.',
		editor: 'wiki',
		defaultPipeline: 'wiki_read',
		isRecommended: false
	},
	{
		type: 'journal',
		category: 'instance',
		label: 'Daily Journal',
		tagline: 'Lightweight daily capture',
		description:
			'One entry stream per day, optimised for getting the thought down now and finding it by date later.',
		editor: 'journal',
		defaultPipeline: 'vector',
		isRecommended: false
	}
];
