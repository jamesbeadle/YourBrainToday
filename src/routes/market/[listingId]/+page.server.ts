import { error, fail, redirect } from '@sveltejs/kit';
import { getListingEditions } from '$lib/server/market/getListingEditions';
import { getMyListingPurchases } from '$lib/server/market/getMyListingPurchases';
import { getPublishedListing } from '$lib/server/market/getBrainListing';
import {
	cancelBrainSubscription,
	marketRefusalMessage,
	purchaseBrainEdition,
	subscribeToBrain
} from '$lib/server/market/purchaseFromMarket';
import { requireUser } from '$lib/server/auth/requireUser';
import type { Actions, PageServerLoad, PageServerLoadEvent, RequestEvent } from './$types';

export const load: PageServerLoad = async (event) => {
	redirect(307, '/');
	return loadListing(event);
};

async function loadListing({ locals, params }: PageServerLoadEvent) {
	const user = await requireUser(locals);
	const listing = await getPublishedListing(locals.supabase, params.listingId);
	if (listing === null) error(404, 'That listing is not on the market');
	return {
		listing,
		isOwnListing: listing.ownerId === user.id,
		editions: await getListingEditions(locals.supabase, listing.id),
		mine: await getMyListingPurchases(locals.supabase, user.id, listing.id)
	};
}

export const actions: Actions = {
	buyEdition: async (event) => {
		redirect(307, '/');
		return buyEdition(event);
	},
	subscribe: async (event) => {
		redirect(307, '/');
		return subscribe(event);
	},
	cancelSubscription: async (event) => {
		redirect(307, '/');
		return cancelSubscription(event);
	}
};

async function buyEdition({ locals, request }: RequestEvent) {
	await requireUser(locals);
	const formData = await request.formData();
	const editionId = String(formData.get('editionId') ?? '');
	if (editionId === '') return fail(400, { message: 'An edition is required.' });
	const purchase = await purchaseBrainEdition(locals.supabase, editionId);
	if (typeof purchase === 'string') {
		return fail(400, { message: marketRefusalMessage(purchase) });
	}
	return {};
}

async function subscribe({ locals, params }: RequestEvent) {
	await requireUser(locals);
	const purchase = await subscribeToBrain(locals.supabase, params.listingId);
	if (typeof purchase === 'string') {
		return fail(400, { message: marketRefusalMessage(purchase) });
	}
	return {};
}

async function cancelSubscription({ locals, params }: RequestEvent) {
	await requireUser(locals);
	await cancelBrainSubscription(locals.supabase, params.listingId);
	return {};
}
