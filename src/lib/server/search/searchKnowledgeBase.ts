import type { SupabaseClient } from '@supabase/supabase-js';

export type KnowledgeHit = {
	hitKind: 'page' | 'item';
	brainId: string;
	itemId: string;
	slug: string | null;
	itemKind: string;
	title: string;
	snippet: string;
	rank: number;
};

export const mostSearchHits = 20;
const longestQuery = 200;

/**
 * Full-text search across every brain of a knowledge base — expertise pages
 * and the items of the experience and human brains — ranked, with a snippet
 * around the match. Runs as whoever holds the client: a person sees what
 * they may read; the service role, already proved to reach the knowledge
 * base, sees all of it.
 */
export async function searchKnowledgeBase(
	supabase: SupabaseClient,
	knowledgeBaseId: string,
	query: string,
	mostHits = mostSearchHits
): Promise<KnowledgeHit[]> {
	const searched = query.trim().slice(0, longestQuery);
	if (searched === '') return [];
	const { data, error } = await supabase.rpc('search_knowledge_base', {
		searched_knowledge_base_id: knowledgeBaseId,
		search_query: searched,
		most_hits: mostHits
	});
	if (error !== null) throw error;
	return ((data ?? []) as SearchRow[]).map(asHit);
}

type SearchRow = {
	hit_kind: string;
	brain_id: string;
	item_id: string;
	slug: string | null;
	item_kind: string;
	title: string;
	snippet: string | null;
	rank: number;
};

function asHit(row: SearchRow): KnowledgeHit {
	return {
		hitKind: row.hit_kind === 'page' ? 'page' : 'item',
		brainId: row.brain_id,
		itemId: row.item_id,
		slug: row.slug,
		itemKind: row.item_kind,
		title: row.title,
		snippet: cleanSnippet(row.snippet ?? ''),
		rank: Number(row.rank)
	};
}

// Postgres marks matches with <b> tags; the snippet is plain text everywhere it is shown.
function cleanSnippet(snippet: string): string {
	return snippet.replace(/<\/?b>/g, '').replace(/\s+/g, ' ').trim();
}
