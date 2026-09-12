import type { SupabaseClient } from '@supabase/supabase-js';
import type { BrainContext } from '$lib/data/brainTypes';

export async function getBrainContexts(
	supabase: SupabaseClient,
	brainId: string
): Promise<BrainContext[]> {
	const { data, error } = await supabase
		.from('brain_contexts')
		.select('slug, name, summary, is_core_domain')
		.eq('brain_id', brainId)
		.order('is_core_domain', { ascending: false })
		.order('name');
	if (error !== null) throw error;
	return (data ?? []).map((row) => ({
		slug: row.slug,
		name: row.name,
		summary: row.summary,
		isCoreDomain: row.is_core_domain
	}));
}
