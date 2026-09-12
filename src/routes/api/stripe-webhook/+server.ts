import { error, json } from '@sveltejs/kit';
import type Stripe from 'stripe';
import { env } from '$env/dynamic/private';
import { handleStripeEvent } from '$lib/server/payments/handleStripeEvent';
import { stripeClient } from '$lib/server/payments/stripeClient';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const stripe = stripeClient();
	if (stripe === null || !env.STRIPE_WEBHOOK_SECRET) error(503, 'stripe_not_configured');
	const signature = request.headers.get('stripe-signature');
	if (signature === null) error(400, 'missing_signature');
	const payload = await request.text();
	const stripeEvent = await verifiedEvent(stripe, payload, signature);
	await handleStripeEvent(stripe, stripeEvent);
	return json({ received: true });
};

async function verifiedEvent(
	stripe: Stripe,
	payload: string,
	signature: string
): Promise<Stripe.Event> {
	try {
		return await stripe.webhooks.constructEventAsync(
			payload,
			signature,
			env.STRIPE_WEBHOOK_SECRET ?? ''
		);
	} catch {
		error(400, 'invalid_signature');
	}
}
