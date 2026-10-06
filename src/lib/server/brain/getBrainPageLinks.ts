import { linkedSlugsFrom } from './pageCrossLinks';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { BrainPageLink } from '$lib/data/brainModelTypes';

export async function getBrainPageLinks(
	supabase: SupabaseClient,
	brainId: string
): Promise<BrainPageLink[]> {
	const { data, error } = await supabase
		.from('brain_pages')
		.select('slug, body')
		.eq('brain_id', brainId);
	if (error !== null) throw error;
	return (data ?? []).flatMap((row) => linksFrom(row.slug, row.body));
}

function linksFrom(fromSlug: string, body: string): BrainPageLink[] {
	return linkedSlugsFrom(fromSlug, body).map((toSlug) => ({ fromSlug, toSlug }));
}
