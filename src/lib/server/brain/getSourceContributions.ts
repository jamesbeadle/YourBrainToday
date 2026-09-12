import type { SupabaseClient } from '@supabase/supabase-js';

export async function getSourceTouchedSlugs(
	supabase: SupabaseClient,
	sourceId: string
): Promise<string[]> {
	const { data, error } = await supabase
		.from('brain_events')
		.select('page_slug')
		.eq('source_id', sourceId)
		.in('kind', ['page_created', 'page_updated']);
	if (error !== null) throw error;
	const slugs = (data ?? [])
		.map((row) => row.page_slug)
		.filter((slug): slug is string => typeof slug === 'string' && slug !== '');
	return [...new Set(slugs)];
}
