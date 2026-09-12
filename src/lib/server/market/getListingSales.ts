import type { SupabaseClient } from '@supabase/supabase-js';
import type { ListingSales } from '$lib/data/marketTypes';

export async function getListingSales(
	supabase: SupabaseClient,
	listingId: string
): Promise<ListingSales> {
	const { data, error } = await supabase
		.from('brain_purchases')
		.select('kind, current_period_end')
		.eq('listing_id', listingId);
	if (error !== null) throw error;
	const purchases = data ?? [];
	return {
		editionSaleCount: purchases.filter((purchase) => purchase.kind === 'edition').length,
		activeSubscriberCount: purchases.filter(isActiveSubscription).length
	};
}

function isActiveSubscription(purchase: {
	kind: string;
	current_period_end: string | null;
}): boolean {
	if (purchase.kind !== 'subscription') return false;
	if (purchase.current_period_end === null) return false;
	return new Date(purchase.current_period_end).getTime() > Date.now();
}
