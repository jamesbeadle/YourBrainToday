import { downloadSourceFile } from './downloadSourceFile';
import { replaceRecordingWithTranscript } from './replaceRecordingWithTranscript';
import {
	transcribeAudio,
	type RecordingTranscript
} from '$lib/server/transcription/transcribeAudio';
import type { StoredBrainSource } from './findBrainSource';
import type { SupabaseClient } from '@supabase/supabase-js';

export async function transcribeSourceRecording(
	supabase: SupabaseClient,
	recording: StoredBrainSource
): Promise<RecordingTranscript> {
	const audio = await downloadSourceFile(supabase, recording.storagePath);
	const transcript = await transcribeAudio(audio, recording.filename, recording.mimeType);
	if (transcript.text === '') throw new Error('That recording had no speech to transcribe');
	await replaceRecordingWithTranscript(supabase, recording, transcript.text);
	return transcript;
}
