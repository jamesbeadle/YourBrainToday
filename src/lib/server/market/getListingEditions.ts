import type { SupabaseClient } from '@supabase/supabase-js';
import type { BrainEdition } from '$lib/data/marketTypes';

export async function getListingEditions(
	supabase: SupabaseClient,
	listingId: string
): Promise<BrainEdition[]> {
	const { data, error } = await supabase
		.from('brain_editions')
		.select('id, listing_id, snapshot_brain_id, name, version, published_at')
		.eq('listing_id', listingId)
		.order('version', { ascending: false });
	if (error !== null) throw error;
	return (data ?? []).map((row) => ({
		id: row.id,
		listingId: row.listing_id,
		snapshotBrainId: row.snapshot_brain_id,
		name: row.name,
		version: row.version,
		publishedAt: row.published_at
	}));
}
