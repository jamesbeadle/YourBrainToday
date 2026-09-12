import type { SupabaseClient } from '@supabase/supabase-js';

export async function deleteBrainPages(
	supabase: SupabaseClient,
	brainId: string,
	slugs: string[]
): Promise<string[]> {
	if (slugs.length === 0) return [];
	const { data, error } = await supabase
		.from('brain_pages')
		.delete()
		.eq('brain_id', brainId)
		.in('slug', slugs)
		.select('slug');
	if (error !== null) throw error;
	return (data ?? []).map((row) => row.slug);
}

export async function deleteEmptyBrainContexts(
	supabase: SupabaseClient,
	brainId: string,
	slugs: string[]
): Promise<string[]> {
	const deleted: string[] = [];
	for (const slug of slugs) {
		if (await deleteContextIfEmpty(supabase, brainId, slug)) deleted.push(slug);
	}
	return deleted;
}

async function deleteContextIfEmpty(
	supabase: SupabaseClient,
	brainId: string,
	slug: string
): Promise<boolean> {
	const { count, error } = await supabase
		.from('brain_pages')
		.select('slug', { count: 'exact', head: true })
		.eq('brain_id', brainId)
		.eq('context_slug', slug);
	if (error !== null) throw error;
	if ((count ?? 0) > 0) return false;
	const { error: deleteFailure } = await supabase
		.from('brain_contexts')
		.delete()
		.eq('brain_id', brainId)
		.eq('slug', slug);
	if (deleteFailure !== null) throw deleteFailure;
	return true;
}
