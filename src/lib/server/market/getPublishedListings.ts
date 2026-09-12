import { asBrainListing, listingColumns, type BrainListingRow } from './getBrainListing';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { BrainListing } from '$lib/data/marketTypes';

export async function getPublishedListings(supabase: SupabaseClient): Promise<BrainListing[]> {
	const { data, error } = await supabase
		.from('brain_listings')
		.select(listingColumns)
		.eq('is_published', true)
		.order('created_at', { ascending: false })
		.overrideTypes<BrainListingRow[], { merge: false }>();
	if (error !== null) throw error;
	return (data ?? []).map(asBrainListing);
}
