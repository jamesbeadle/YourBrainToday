import type { SupabaseClient } from '@supabase/supabase-js';
import type { BrainSubscription, PurchasedEdition, SubscriptionStatus } from '$lib/data/marketTypes';

type Joined<Row> = Row | Row[] | null;

type PurchasedEditionRow = {
	id: string;
	price_credits: number;
	purchased_at: string;
	brain_listings: Joined<{ headline: string }>;
	brain_editions: Joined<{
		name: string;
		version: number;
		snapshot_brain_id: string;
		domain_brains: Joined<{ id: string; entity_id: string }>;
	}>;
};

type BrainSubscriptionRow = {
	id: string;
	listing_id: string;
	price_credits: number;
	current_period_end: string;
	status: SubscriptionStatus;
	brain_listings: Joined<{
		headline: string;
		brain_id: string;
		domain_brains: Joined<{ entity_id: string }>;
	}>;
};

export async function getPurchasedEditions(
	supabase: SupabaseClient,
	buyerId: string
): Promise<PurchasedEdition[]> {
	const { data, error } = await supabase
		.from('brain_purchases')
		.select(
			'id, price_credits, purchased_at, brain_listings (headline), ' +
				'brain_editions (name, version, snapshot_brain_id, domain_brains (id, entity_id))'
		)
		.eq('buyer_id', buyerId)
		.eq('kind', 'edition')
		.order('purchased_at', { ascending: false })
		.overrideTypes<PurchasedEditionRow[], { merge: false }>();
	if (error !== null) throw error;
	return (data ?? []).map((row) => {
		const edition = one(row.brain_editions);
		const snapshotBrain = one(edition?.domain_brains);
		return {
			purchaseId: row.id,
			headline: one(row.brain_listings)?.headline ?? '',
			editionName: edition?.name ?? '',
			editionVersion: edition?.version ?? 0,
			priceCredits: row.price_credits,
			purchasedAt: row.purchased_at,
			brainId: snapshotBrain?.id ?? '',
			entityId: snapshotBrain?.entity_id ?? ''
		};
	});
}

export async function getBrainSubscriptions(
	supabase: SupabaseClient,
	buyerId: string
): Promise<BrainSubscription[]> {
	const { data, error } = await supabase
		.from('brain_purchases')
		.select(
			'id, listing_id, price_credits, current_period_end, status, ' +
				'brain_listings (headline, brain_id, domain_brains (entity_id))'
		)
		.eq('buyer_id', buyerId)
		.eq('kind', 'subscription')
		.order('current_period_end', { ascending: false })
		.overrideTypes<BrainSubscriptionRow[], { merge: false }>();
	if (error !== null) throw error;
	return (data ?? []).map((row) => {
		const listing = one(row.brain_listings);
		return {
			purchaseId: row.id,
			listingId: row.listing_id,
			headline: listing?.headline ?? '',
			priceCredits: row.price_credits,
			currentPeriodEnd: row.current_period_end,
			status: row.status,
			brainId: listing?.brain_id ?? '',
			entityId: one(listing?.domain_brains)?.entity_id ?? ''
		};
	});
}

function one<Row>(joined: Joined<Row> | undefined): Row | undefined {
	if (joined === null || joined === undefined) return undefined;
	if (Array.isArray(joined)) return joined[0];
	return joined;
}
