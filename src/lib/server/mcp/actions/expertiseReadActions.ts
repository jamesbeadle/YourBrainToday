import { knowledgeBaseIdField, onOwnedKnowledgeBase } from './ownedKnowledgeBases';
import { objectSchema, readTextList, textListField } from '../actionTypes';
import { readKnowledgeBase } from '$lib/server/knowledge/reading/readKnowledgeBase';
import { fetchKeyedPages, renderKeyedPages } from '$lib/server/knowledge/reading/readExpertisePages';
import { renderExpertiseIndex } from '$lib/server/knowledge/reading/renderExpertiseIndex';
import type { McpAction } from '../actionTypes';

const mostPagesPerRead = 10;

export const expertiseReadActions: McpAction[] = [
	{
		name: 'read_expertise_index',
		area: 'brains',
		audience: 'everyone',
		isWrite: false,
		summary: 'The expertise brain’s index — every bounded context and page, with a line each',
		guidance:
			'Every page is addressed by its key, brain-handle/page-slug, exactly as the index prints ' +
			'it. Pick the pages that could hold what you need and read them with read_expertise_pages.',
		inputSchema: objectSchema({ knowledge_base_id: knowledgeBaseIdField }, ['knowledge_base_id']),
		run: onOwnedKnowledgeBase(async (caller, knowledgeBase) => {
			const reading = await readKnowledgeBase(caller.supabase, knowledgeBase.id, ['expertise']);
			return renderExpertiseIndex(reading.expertise);
		})
	},
	{
		name: 'read_expertise_pages',
		area: 'brains',
		audience: 'everyone',
		isWrite: false,
		summary: `The full bodies of up to ${mostPagesPerRead} expertise pages, by key`,
		inputSchema: objectSchema(
			{
				knowledge_base_id: knowledgeBaseIdField,
				keys: textListField(`Page keys from read_expertise_index, ${mostPagesPerRead} at most`)
			},
			['knowledge_base_id', 'keys']
		),
		run: onOwnedKnowledgeBase(async (caller, knowledgeBase, input) => {
			const keys = readTextList(input, 'keys').slice(0, mostPagesPerRead);
			if (keys.length === 0) return 'Name at least one page key, as read_expertise_index prints them.';
			const reading = await readKnowledgeBase(caller.supabase, knowledgeBase.id, ['expertise']);
			const pages = await fetchKeyedPages(caller.supabase, reading.expertise, keys);
			return renderKeyedPages(keys, pages);
		})
	}
];
