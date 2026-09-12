import type { SupabaseClient } from '@supabase/supabase-js';
import type { BrainPageLink } from '$lib/data/brainTypes';

const crossLinkPattern = /\]\(\/domain-brain\/([a-z0-9-]+)\)/g;

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
	const targets = [...body.matchAll(crossLinkPattern)].map((match) => match[1]);
	const uniqueTargets = [...new Set(targets)].filter((target) => target !== fromSlug);
	return uniqueTargets.map((toSlug) => ({ fromSlug, toSlug }));
}
