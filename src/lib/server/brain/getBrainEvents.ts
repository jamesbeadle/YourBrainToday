import type { SupabaseClient } from '@supabase/supabase-js';
import type { BrainEvent } from '$lib/data/brainTypes';

const recentEventCount = 30;
const maxExportedEventCount = 2000;

export async function getBrainEvents(
	supabase: SupabaseClient,
	brainId: string
): Promise<BrainEvent[]> {
	return queryEvents(supabase, brainId, { ascending: false, limit: recentEventCount });
}

export async function getFullBrainEventLog(
	supabase: SupabaseClient,
	brainId: string
): Promise<BrainEvent[]> {
	return queryEvents(supabase, brainId, { ascending: true, limit: maxExportedEventCount });
}

async function queryEvents(
	supabase: SupabaseClient,
	brainId: string,
	order: { ascending: boolean; limit: number }
): Promise<BrainEvent[]> {
	const { data, error } = await supabase
		.from('brain_events')
		.select('id, kind, detail, page_slug, created_at')
		.eq('brain_id', brainId)
		.order('created_at', { ascending: order.ascending })
		.limit(order.limit);
	if (error !== null) throw error;
	return (data ?? []).map((row) => ({
		id: row.id,
		kind: row.kind,
		detail: row.detail,
		pageSlug: row.page_slug,
		createdAt: row.created_at
	}));
}
