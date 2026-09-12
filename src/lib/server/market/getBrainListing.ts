import type { SupabaseClient } from '@supabase/supabase-js';
import type { BrainListing } from '$lib/data/marketTypes';

export const listingColumns =
	'id, brain_id, owner_id, owner_name, headline, description, edition_price_credits, ' +
	'subscription_price_credits, is_published, created_at';

export type BrainListingRow = {
	id: string;
	brain_id: string;
	owner_id: string;
	owner_name: string;
	headline: string;
	description: string;
	edition_price_credits: number | null;
	subscription_price_credits: number | null;
	is_published: boolean;
	created_at: string;
};

export async function getListingForBrain(
	supabase: SupabaseClient,
	brainId: string
): Promise<BrainListing | null> {
	const { data, error } = await supabase
		.from('brain_listings')
		.select(listingColumns)
		.eq('brain_id', brainId)
		.maybeSingle()
		.overrideTypes<BrainListingRow, { merge: false }>();
	if (error !== null) throw error;
	if (data === null) return null;
	return asBrainListing(data);
}

export async function getPublishedListing(
	supabase: SupabaseClient,
	listingId: string
): Promise<BrainListing | null> {
	const { data, error } = await supabase
		.from('brain_listings')
		.select(listingColumns)
		.eq('id', listingId)
		.maybeSingle()
		.overrideTypes<BrainListingRow, { merge: false }>();
	if (error !== null) throw error;
	if (data === null) return null;
	return asBrainListing(data);
}

export function asBrainListing(row: BrainListingRow): BrainListing {
	return {
		id: row.id,
		brainId: row.brain_id,
		ownerId: row.owner_id,
		ownerName: row.owner_name,
		headline: row.headline,
		description: row.description,
		editionPriceCredits: row.edition_price_credits,
		subscriptionPriceCredits: row.subscription_price_credits,
		isPublished: row.is_published,
		createdAt: row.created_at
	};
}
