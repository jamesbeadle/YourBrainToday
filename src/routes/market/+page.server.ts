import { redirect } from '@sveltejs/kit';
import { getBrainSubscriptions, getPurchasedEditions } from '$lib/server/market/getMyPurchases';
import { getPublishedListings } from '$lib/server/market/getPublishedListings';
import { requireUser } from '$lib/server/auth/requireUser';
import type { PageServerLoad, PageServerLoadEvent } from './$types';

export const load: PageServerLoad = async (event) => {
	redirect(307, '/');
	return loadMarketplace(event);
};

async function loadMarketplace({ locals }: PageServerLoadEvent) {
	const user = await requireUser(locals);
	return {
		viewerId: user.id,
		listings: await getPublishedListings(locals.supabase),
		purchasedEditions: await getPurchasedEditions(locals.supabase, user.id),
		subscriptions: await getBrainSubscriptions(locals.supabase, user.id)
	};
}
