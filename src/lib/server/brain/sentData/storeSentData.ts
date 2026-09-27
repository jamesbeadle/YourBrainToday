import { safeStorageFilename } from '$lib/server/storage/safeStorageFilename';
import { sourcesBucket } from '../brainStorage';
import type { StoredBrainSource } from '../findBrainSource';
import type { SentData, SentDataOrigin } from './sentDataTypes';
import type { SupabaseClient } from '@supabase/supabase-js';

const sentDataMimeType = 'text/plain';

export function sentDataByteCount(sent: SentData): number {
	return new TextEncoder().encode(sent.text).length;
}

/** Files sent text as a brain source, exactly as an upload would be, ready to be read. */
export async function storeSentData(
	serviceSupabase: SupabaseClient,
	brain: { id: string; ownerId: string },
	sent: SentData,
	origin: SentDataOrigin
): Promise<StoredBrainSource> {
	const sourceId = crypto.randomUUID();
	const source: StoredBrainSource = {
		id: sourceId,
		brainId: brain.id,
		filename: sent.title,
		mimeType: sentDataMimeType,
		storagePath: `${brain.ownerId}/${sourceId}/${safeStorageFilename(sent.title)}.txt`,
		status: 'uploaded',
		byteCount: sentDataByteCount(sent),
		summary: ''
	};
	await uploadText(serviceSupabase, source.storagePath, sent.text);
	await insertSourceRow(serviceSupabase, source, origin);
	return source;
}

async function uploadText(serviceSupabase: SupabaseClient, path: string, text: string) {
	const { error } = await serviceSupabase.storage
		.from(sourcesBucket)
		.upload(path, new Blob([text], { type: sentDataMimeType }), { contentType: sentDataMimeType });
	if (error !== null) throw error;
}

async function insertSourceRow(
	serviceSupabase: SupabaseClient,
	source: StoredBrainSource,
	origin: SentDataOrigin
) {
	const { error } = await serviceSupabase.from('brain_sources').insert({
		id: source.id,
		brain_id: source.brainId,
		filename: source.filename,
		mime_type: source.mimeType,
		byte_count: source.byteCount,
		storage_path: source.storagePath,
		arrived_through: origin
	});
	if (error !== null) throw error;
}
