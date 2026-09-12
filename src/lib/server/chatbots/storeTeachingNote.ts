import { createBrainSource } from '../brain/createBrainSource';
import { deleteBrainSource } from '../brain/deleteBrainSource';
import { findBrainSource } from '../brain/findBrainSource';
import { teachingNoteFilename, teachingNoteMimeType } from './renderTeachingNote';
import type { SupabaseClient } from '@supabase/supabase-js';

export async function storeTeachingNote(
	supabase: SupabaseClient,
	userId: string,
	brainId: string,
	question: string,
	note: string
): Promise<string> {
	const grant = await createBrainSource(supabase, userId, brainId, {
		filename: teachingNoteFilename(question),
		mimeType: teachingNoteMimeType,
		byteCount: byteCountOf(note)
	});
	const response = await fetch(grant.uploadUrl, {
		method: 'PUT',
		headers: { 'content-type': teachingNoteMimeType },
		body: note
	});
	if (!response.ok) throw new Error(`Storing the answer failed with status ${response.status}`);
	return grant.sourceId;
}

export async function discardTeachingNote(
	supabase: SupabaseClient,
	sourceId: string
): Promise<void> {
	const source = await findBrainSource(supabase, sourceId);
	if (source !== null) await deleteBrainSource(supabase, source);
}

export function byteCountOf(text: string): number {
	return new TextEncoder().encode(text).length;
}
