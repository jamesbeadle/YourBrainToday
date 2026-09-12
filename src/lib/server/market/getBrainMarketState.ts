import { getListingEditions } from './getListingEditions';
import { getListingForBrain } from './getBrainListing';
import { getListingSales } from './getListingSales';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { BrainEdition, BrainListing, ListingSales } from '$lib/data/marketTypes';

export type BrainMarketState = {
	listing: BrainListing | null;
	editions: BrainEdition[];
	sales: ListingSales | null;
};

const emptyMarketState: BrainMarketState = { listing: null, editions: [], sales: null };

export async function getBrainMarketState(
	supabase: SupabaseClient,
	brainId: string
): Promise<BrainMarketState> {
	const listing = await getListingForBrain(supabase, brainId);
	if (listing === null) return emptyMarketState;
	return {
		listing,
		editions: await getListingEditions(supabase, listing.id),
		sales: await getListingSales(supabase, listing.id)
	};
}
