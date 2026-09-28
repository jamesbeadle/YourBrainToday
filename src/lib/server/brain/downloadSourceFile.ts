import { sourcesBucket } from './brainStorage';
import type { SupabaseClient } from '@supabase/supabase-js';

export async function downloadSourceFile(
	supabase: SupabaseClient,
	storagePath: string
): Promise<Uint8Array> {
	const { data, error } = await supabase.storage.from(sourcesBucket).download(storagePath);
	if (error !== null) throw error;
	return new Uint8Array(await data.arrayBuffer());
}
