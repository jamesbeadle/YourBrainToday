import type { SupabaseClient } from '@supabase/supabase-js';
import type { SubscriptionStatus } from '$lib/data/marketTypes';

export type MyListingPurchases = {
	ownedEditionIds: string[];
	subscription: { status: SubscriptionStatus; currentPeriodEnd: string } | null;
};

export async function getMyListingPurchases(
	supabase: SupabaseClient,
	buyerId: string,
	listingId: string
): Promise<MyListingPurchases> {
	const { data, error } = await supabase
		.from('brain_purchases')
		.select('kind, edition_id, current_period_end, status')
		.eq('buyer_id', buyerId)
		.eq('listing_id', listingId);
	if (error !== null) throw error;
	const purchases = data ?? [];
	const subscriptionRow = purchases.find((purchase) => purchase.kind === 'subscription');
	return {
		ownedEditionIds: purchases
			.filter((purchase) => purchase.edition_id !== null)
			.map((purchase) => String(purchase.edition_id)),
		subscription:
			subscriptionRow === undefined
				? null
				: {
						status: subscriptionRow.status as SubscriptionStatus,
						currentPeriodEnd: String(subscriptionRow.current_period_end)
					}
	};
}
