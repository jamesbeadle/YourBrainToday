import { sourcesBucket } from './brainStorage';
import type { StoredBrainSource } from './findBrainSource';
import type { SupabaseClient } from '@supabase/supabase-js';

const transcriptMimeType = 'text/plain';

/** The transcript takes the recording's place as the source; the audio itself is not kept. */
export async function replaceRecordingWithTranscript(
	supabase: SupabaseClient,
	recording: StoredBrainSource,
	transcript: string
): Promise<void> {
	const transcriptText = `Transcript of the recording "${recording.filename}"\n\n${transcript}`;
	const transcriptPath = `${recording.storagePath}.transcript.txt`;
	await uploadTranscript(supabase, transcriptPath, transcriptText);
	await pointSourceAtTranscript(supabase, recording.id, transcriptPath, transcriptText);
	await removeRecording(supabase, recording.storagePath);
}

async function uploadTranscript(supabase: SupabaseClient, path: string, text: string) {
	const { error } = await supabase.storage
		.from(sourcesBucket)
		.upload(path, new Blob([text], { type: transcriptMimeType }), {
			contentType: transcriptMimeType
		});
	if (error !== null) throw error;
}

async function pointSourceAtTranscript(
	supabase: SupabaseClient,
	sourceId: string,
	path: string,
	text: string
) {
	const { error } = await supabase
		.from('brain_sources')
		.update({
			mime_type: transcriptMimeType,
			storage_path: path,
			byte_count: new TextEncoder().encode(text).length
		})
		.eq('id', sourceId)
		.select('id')
		.single();
	if (error !== null) throw error;
}

async function removeRecording(supabase: SupabaseClient, path: string) {
	const { error } = await supabase.storage.from(sourcesBucket).remove([path]);
	if (error !== null) console.error('Removing a transcribed recording failed', path, error);
}
