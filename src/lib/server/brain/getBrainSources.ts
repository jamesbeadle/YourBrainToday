import type { SupabaseClient } from '@supabase/supabase-js';
import type { BrainSource } from '$lib/data/brainTypes';

export async function getBrainSources(
	supabase: SupabaseClient,
	brainId: string
): Promise<BrainSource[]> {
	const { data, error } = await supabase
		.from('brain_sources')
		.select('id, filename, mime_type, byte_count, status, summary, arrived_through, created_at')
		.eq('brain_id', brainId)
		.order('created_at', { ascending: false });
	if (error !== null) throw error;
	return (data ?? []).map((row) => ({
		id: row.id,
		filename: row.filename,
		mimeType: row.mime_type,
		byteCount: row.byte_count,
		status: row.status,
		summary: row.summary,
		arrivedThrough: row.arrived_through,
		createdAt: row.created_at
	}));
}
