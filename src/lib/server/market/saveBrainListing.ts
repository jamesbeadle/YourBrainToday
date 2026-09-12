import type { SupabaseClient } from '@supabase/supabase-js';

export type ListingDraft = {
	brainId: string;
	ownerEmail: string;
	ownerName: string;
	headline: string;
	description: string;
	editionPriceCredits: number | null;
	subscriptionPriceCredits: number | null;
};

export async function upsertBrainListing(
	supabase: SupabaseClient,
	draft: ListingDraft
): Promise<void> {
	const { error } = await supabase.from('brain_listings').upsert(
		{
			brain_id: draft.brainId,
			owner_email: draft.ownerEmail,
			owner_name: draft.ownerName,
			headline: draft.headline,
			description: draft.description,
			edition_price_credits: draft.editionPriceCredits,
			subscription_price_credits: draft.subscriptionPriceCredits
		},
		{ onConflict: 'brain_id' }
	);
	if (error !== null) throw error;
}

export async function setListingPublished(
	supabase: SupabaseClient,
	listingId: string,
	isPublished: boolean
): Promise<void> {
	const { error } = await supabase
		.from('brain_listings')
		.update({ is_published: isPublished })
		.eq('id', listingId);
	if (error !== null) throw error;
}
