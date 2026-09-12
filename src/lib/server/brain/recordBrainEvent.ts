import type { SupabaseClient } from '@supabase/supabase-js';
import type { BrainEventKind } from '$lib/data/brainTypes';

export async function recordBrainEvent(
	supabase: SupabaseClient,
	event: {
		brainId: string;
		kind: BrainEventKind;
		detail: Record<string, unknown>;
		sourceId?: string;
		pageSlug?: string;
	}
): Promise<void> {
	const { error } = await supabase.from('brain_events').insert({
		brain_id: event.brainId,
		kind: event.kind,
		detail: event.detail,
		source_id: event.sourceId ?? null,
		page_slug: event.pageSlug ?? null
	});
	if (error !== null) throw error;
}
