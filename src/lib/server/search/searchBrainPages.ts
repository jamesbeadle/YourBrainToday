import { clipSearchWords, mostSearchHits, plainSnippet } from './searchWords';
import type { DomainBlockKind } from '$lib/data/brainModelTypes';
import type { SupabaseClient } from '@supabase/supabase-js';

export type BrainPageHit = {
	slug: string;
	kind: DomainBlockKind;
	title: string;
	snippet: string;
	rank: number;
};

/**
 * Full-text search over the pages of one expertise brain — title, summary
 * and body — ranked, with a snippet around the match. Runs as whoever holds
 * the client, so a person sees the pages they may read and the service role
 * sees them all.
 */
export async function searchBrainPages(
	supabase: SupabaseClient,
	brainId: string,
	query: string,
	mostHits = mostSearchHits
): Promise<BrainPageHit[]> {
	const searched = clipSearchWords(query);
	if (searched === '') return [];
	const { data, error } = await supabase.rpc('search_brain_pages', {
		searched_brain_id: brainId,
		search_query: searched,
		most_hits: mostHits
	});
	if (error !== null) throw error;
	return ((data ?? []) as PageHitRow[]).map(asPageHit);
}

type PageHitRow = { slug: string; kind: string; title: string; snippet: string | null; rank: number };

function asPageHit(row: PageHitRow): BrainPageHit {
	return {
		slug: row.slug,
		kind: row.kind as DomainBlockKind,
		title: row.title,
		snippet: plainSnippet(row.snippet),
		rank: Number(row.rank)
	};
}
