import { sourcesBucket } from '$lib/server/brain/brainStorage';
import type { SupabaseClient } from '@supabase/supabase-js';

export async function deleteDomainBrain(supabase: SupabaseClient, brainId: string): Promise<void> {
	await removeStoredSourceFiles(supabase, brainId);
	const { error } = await supabase.from('domain_brains').delete().eq('id', brainId);
	if (error !== null) throw error;
}

async function removeStoredSourceFiles(supabase: SupabaseClient, brainId: string): Promise<void> {
	const storagePaths = await getSourceStoragePaths(supabase, brainId);
	if (storagePaths.length === 0) return;
	const { error } = await supabase.storage.from(sourcesBucket).remove(storagePaths);
	if (error !== null) throw error;
}

async function getSourceStoragePaths(
	supabase: SupabaseClient,
	brainId: string
): Promise<string[]> {
	const { data, error } = await supabase
		.from('brain_sources')
		.select('storage_path')
		.eq('brain_id', brainId);
	if (error !== null) throw error;
	return (data ?? [])
		.map((row) => row.storage_path)
		.filter((path): path is string => typeof path === 'string' && path !== '');
}
