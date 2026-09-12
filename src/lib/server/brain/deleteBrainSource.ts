import { sourcesBucket } from './brainStorage';
import type { StoredBrainSource } from './findBrainSource';
import type { SupabaseClient } from '@supabase/supabase-js';

export async function deleteBrainSource(
	supabase: SupabaseClient,
	source: StoredBrainSource
): Promise<void> {
	const { error: storageFailure } = await supabase.storage
		.from(sourcesBucket)
		.remove([source.storagePath]);
	if (storageFailure !== null) throw storageFailure;
	const { error } = await supabase.from('brain_sources').delete().eq('id', source.id);
	if (error !== null) throw error;
}
