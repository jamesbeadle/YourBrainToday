import { renderKnowledgeHits } from '$lib/server/search/renderKnowledgeHits';
import { searchKnowledgeBase } from '$lib/server/search/searchKnowledgeBase';
import type { AnthropicTool } from '$lib/server/anthropic/anthropicTypes';
import type { KnowledgeBaseReading } from './readKnowledgeBase';
import type { SupabaseClient } from '@supabase/supabase-js';

export const searchKnowledgeTool: AnthropicTool = {
	name: 'search_knowledge',
	description:
		'Search every brain of the knowledge base by words — expertise pages and the items of the ' +
		'experience and human brains. Each hit names a page key for read_pages, or the brain an ' +
		'item sits in, with the snippet that matched. Use it when the index does not name what you need.',
	input_schema: {
		type: 'object',
		required: ['query'],
		properties: { query: { type: 'string', description: 'A few words, as they would appear in the text' } }
	}
};

/** The hits for one query, rendered as the model (or a connected Claude) reads them. */
export async function searchReading(
	supabase: SupabaseClient,
	reading: KnowledgeBaseReading,
	query: string
): Promise<string> {
	const hits = await searchKnowledgeBase(supabase, reading.knowledgeBaseId, query);
	return renderKnowledgeHits(hits, reading.expertise, reading.brainNames);
}

export function queryFrom(input: unknown): string {
	if (typeof input !== 'object' || input === null) return '';
	const candidate = (input as { query?: unknown }).query;
	return typeof candidate === 'string' ? candidate : '';
}
