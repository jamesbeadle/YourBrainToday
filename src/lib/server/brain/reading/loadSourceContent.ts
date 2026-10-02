import { downloadSourceFile } from '../downloadSourceFile';
import { sourceContentBlock } from '../sourceContentBlock';
import type { StoredBrainSource } from '../findBrainSource';
import type { SupabaseClient } from '@supabase/supabase-js';

export type SourceContent = { contentBlock: unknown; byteCount: number };

/** The stored file, as the block Claude reads, and how big it really is. */
export async function loadSourceContent(
	supabase: SupabaseClient,
	source: StoredBrainSource
): Promise<SourceContent> {
	const fileBytes = await downloadSourceFile(supabase, source.storagePath);
	return {
		contentBlock: await sourceContentBlock(fileBytes, source.mimeType),
		byteCount: fileBytes.byteLength
	};
}

/**
 * The browser declares a file's size before the upload; the stored file is
 * the truth. A file that arrived larger than declared is priced on what it
 * is, so the declaration can never undercut the reading.
 */
export async function reconcileByteCount(
	supabase: SupabaseClient,
	source: StoredBrainSource,
	actualByteCount: number
): Promise<number> {
	if (actualByteCount <= source.byteCount) return source.byteCount;
	const { error } = await supabase
		.from('brain_sources')
		.update({ byte_count: actualByteCount })
		.eq('id', source.id);
	if (error !== null) throw error;
	return actualByteCount;
}
