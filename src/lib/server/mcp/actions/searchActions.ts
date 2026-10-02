import { knowledgeBaseIdField, onOwnedKnowledgeBase } from './ownedKnowledgeBases';
import { objectSchema, readText, textField } from '../actionTypes';
import { readKnowledgeBase } from '$lib/server/knowledge/reading/readKnowledgeBase';
import { searchReading } from '$lib/server/knowledge/reading/searchKnowledgeTool';
import type { McpAction } from '../actionTypes';

export const searchActions: McpAction[] = [
	{
		name: 'search_knowledge_base',
		area: 'brains',
		audience: 'everyone',
		isWrite: false,
		summary: 'Search every brain of a knowledge base by words — pages and items that mention them',
		guidance:
			'Use it when read_expertise_index does not name what you need. A page hit gives the key ' +
			'read_expertise_pages takes; an item hit names the brain it sits in. Free — no Claude ' +
			'call is made on the server.',
		inputSchema: objectSchema(
			{
				knowledge_base_id: knowledgeBaseIdField,
				query: textField('A few words, as they would appear in the text')
			},
			['knowledge_base_id', 'query']
		),
		run: onOwnedKnowledgeBase(async (caller, knowledgeBase, input) => {
			const query = readText(input, 'query');
			if (query === '') return 'Give a few words to search for.';
			const reading = await readKnowledgeBase(caller.supabase, knowledgeBase.id, ['expertise']);
			return searchReading(caller.supabase, reading, query);
		})
	}
];
