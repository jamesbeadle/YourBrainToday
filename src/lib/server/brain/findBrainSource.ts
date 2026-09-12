import type { SupabaseClient } from '@supabase/supabase-js';

export type StoredBrainSource = {
	id: string;
	brainId: string;
	filename: string;
	mimeType: string;
	storagePath: string;
	status: string;
	byteCount: number;
};

export async function findBrainSource(
	supabase: SupabaseClient,
	sourceId: string
): Promise<StoredBrainSource | null> {
	const { data, error } = await supabase
		.from('brain_sources')
		.select('id, brain_id, filename, mime_type, storage_path, status, byte_count')
		.eq('id', sourceId)
		.maybeSingle();
	if (error !== null) throw error;
	if (data === null) return null;
	return {
		id: data.id,
		brainId: data.brain_id,
		filename: data.filename,
		mimeType: data.mime_type,
		storagePath: data.storage_path,
		status: data.status,
		byteCount: data.byte_count ?? 0
	};
}

export async function markSourceStatus(
	supabase: SupabaseClient,
	sourceId: string,
	status: 'ingested' | 'failed' | 'proposed' | 'rejected',
	summary = ''
): Promise<void> {
	const { error } = await supabase
		.from('brain_sources')
		.update({ status, ...(summary === '' ? {} : { summary }) })
		.eq('id', sourceId);
	if (error !== null) throw error;
}
