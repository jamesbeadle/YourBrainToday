import { asBrainSource } from '../getBrainSources';
import { storedSourceColumns } from '../findBrainSource';
import type { BrainSource } from '$lib/data/brainTypes';
import type { SupabaseClient } from '@supabase/supabase-js';

/** Where a source's reading stands now, as the sources list shows it. */
export async function readingStateFor(
	supabase: SupabaseClient,
	sourceId: string
): Promise<BrainSource> {
	const { data, error } = await supabase
		.from('brain_sources')
		.select(`${storedSourceColumns}, arrived_through, created_at`)
		.eq('id', sourceId)
		.single();
	if (error !== null) throw error;
	return asBrainSource(data as unknown as Record<string, unknown>);
}
