import { recordBrainEvent } from './recordBrainEvent';
import type { SupabaseClient } from '@supabase/supabase-js';

type AppliedWrite = { slug: string; wasCreated: boolean };

export async function recordPruneEvents(
	supabase: SupabaseClient,
	brainId: string,
	contextWrites: AppliedWrite[],
	pageWrites: AppliedWrite[],
	deletedSlugs: string[]
): Promise<void> {
	for (const write of contextWrites) {
		await recordBrainEvent(supabase, {
			brainId,
			kind: write.wasCreated ? 'context_created' : 'context_updated',
			detail: { contextSlug: write.slug }
		});
	}
	for (const write of pageWrites) {
		await recordBrainEvent(supabase, {
			brainId,
			kind: write.wasCreated ? 'page_created' : 'page_updated',
			detail: {},
			pageSlug: write.slug
		});
	}
	for (const slug of deletedSlugs) {
		await recordBrainEvent(supabase, {
			brainId,
			kind: 'page_deleted',
			detail: { pageSlug: slug }
		});
	}
}
