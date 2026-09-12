import { fail, redirect } from '@sveltejs/kit';
import { getCreditPacks } from '$lib/server/credits/getCreditPacks';
import { getProfileFlags } from '$lib/server/auth/getProfileFlags';
import { createCheckoutSession } from '$lib/server/payments/createCheckoutSession';
import {
	creditedReturnPath,
	isReturningFromStripe,
	reconcileCheckoutReturn
} from '$lib/server/payments/reconcileCheckoutReturn';
import { requireUser } from '$lib/server/auth/requireUser';
import { stripeClient } from '$lib/server/payments/stripeClient';
import type { Actions, PageServerLoad } from './$types';

const earlyAccessMessage =
	'Checkout is not open yet — during early access, credits are granted directly by the Your Brain Today team.';

export const load: PageServerLoad = async ({ locals, url }) => {
	const user = await requireUser(locals);
	const stripe = stripeClient();
	const checkoutOutcome = await reconcileCheckoutReturn(url.searchParams, stripe, user.id);
	if (checkoutOutcome === 'credited' && isReturningFromStripe(url.searchParams)) {
		redirect(303, creditedReturnPath);
	}
	return {
		creditPacks: await getCreditPacks(locals.supabase),
		checkoutOutcome,
		isCheckoutLive: stripe !== null
	};
};

export const actions: Actions = {
	buy: async ({ locals, request, url }) => {
		const user = await requireUser(locals);
		const formData = await request.formData();
		const packId = String(formData.get('packId') ?? '');
		if (packId === '') return fail(400, { message: 'Choose a pack to buy.' });
		const profileFlags = await getProfileFlags(locals.supabase);
		if (profileFlags.isRestricted) {
			return fail(403, { message: 'This account is currently restricted from purchases.' });
		}
		const stripe = stripeClient();
		if (stripe === null) return fail(503, { message: earlyAccessMessage });
		const creditPack = (await getCreditPacks(locals.supabase)).find((pack) => pack.id === packId);
		if (creditPack === undefined) return fail(400, { message: 'Choose a pack to buy.' });
		redirect(303, await createCheckoutSession(stripe, creditPack, user.id, url.origin));
	}
};
