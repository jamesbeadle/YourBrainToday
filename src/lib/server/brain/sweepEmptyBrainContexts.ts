import { recordBrainEvent } from './recordBrainEvent';
import type { SupabaseClient } from '@supabase/supabase-js';

export async function sweepEmptyBrainContexts(
	supabase: SupabaseClient,
	brainId: string,
	sourceId?: string
): Promise<string[]> {
	const emptySlugs = await findEmptyContextSlugs(supabase, brainId);
	if (emptySlugs.length === 0) return [];
	const { error } = await supabase
		.from('brain_contexts')
		.delete()
		.eq('brain_id', brainId)
		.in('slug', emptySlugs);
	if (error !== null) throw error;
	for (const slug of emptySlugs) {
		await recordBrainEvent(supabase, {
			brainId,
			kind: 'context_deleted',
			detail: { contextSlug: slug, reason: 'context had no pages' },
			sourceId
		});
	}
	return emptySlugs;
}

async function findEmptyContextSlugs(
	supabase: SupabaseClient,
	brainId: string
): Promise<string[]> {
	const { data: contexts, error } = await supabase
		.from('brain_contexts')
		.select('slug')
		.eq('brain_id', brainId);
	if (error !== null) throw error;
	const { data: pages, error: pagesFailure } = await supabase
		.from('brain_pages')
		.select('context_slug')
		.eq('brain_id', brainId);
	if (pagesFailure !== null) throw pagesFailure;
	const populatedSlugs = new Set((pages ?? []).map((row) => row.context_slug));
	return (contexts ?? [])
		.map((row) => row.slug)
		.filter((slug) => !populatedSlugs.has(slug));
}
