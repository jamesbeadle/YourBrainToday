import { domainBlockLabels } from '$lib/data/domainBlocks';
import { queryFrom } from '$lib/server/search/queryFrom';
import { searchBrainPages, type BrainPageHit } from '$lib/server/search/searchBrainPages';
import type { AnthropicTool, AnthropicToolUseBlock } from '$lib/server/anthropic/anthropicTypes';
import type { SupabaseClient } from '@supabase/supabase-js';

export const searchPagesTool: AnthropicTool = {
	name: 'search_pages',
	description:
		'Search the full bodies of every page of this model by words. Each hit names a slug for ' +
		'read_pages with the snippet that matched. Use it when the index summaries do not name ' +
		'what you need.',
	input_schema: {
		type: 'object',
		required: ['query'],
		properties: { query: { type: 'string', description: 'A few words, as they would appear in the text' } }
	}
};

export async function searchPagesResultBlock(
	supabase: SupabaseClient,
	brainId: string,
	searchRequest: AnthropicToolUseBlock
): Promise<unknown> {
	const hits = await searchBrainPages(supabase, brainId, queryFrom(searchRequest.input));
	return { type: 'tool_result', tool_use_id: searchRequest.id, content: renderPageHits(hits) };
}

export function renderPageHits(hits: BrainPageHit[]): string {
	if (hits.length === 0) return 'No page of the model matches those words.';
	return hits.map(renderPageHit).join('\n');
}

function renderPageHit(hit: BrainPageHit): string {
	const kindLabel = domainBlockLabels[hit.kind].singular;
	return `- ${hit.slug} [${kindLabel}] — ${hit.title}: ${hit.snippet}`;
}
