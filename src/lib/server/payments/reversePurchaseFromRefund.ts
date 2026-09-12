import type Stripe from 'stripe';
import { supabaseServiceClient } from './supabaseServiceClient';

const purchaseNotFoundError = 'purchase_not_found';

export async function reversePurchaseFromRefund(
	stripe: Stripe,
	charge: Stripe.Charge
): Promise<void> {
	if (!charge.refunded) {
		console.warn('Stripe charge partially refunded — credits left in place', charge.id);
		return;
	}
	const session = await checkoutSessionForCharge(stripe, charge);
	if (session === null) {
		console.warn('Stripe charge refunded without a checkout session', charge.id);
		return;
	}
	const supabase = supabaseServiceClient();
	const { error } = await supabase.rpc('reverse_purchase_credits', {
		session_identifier: session.id
	});
	if (!error) return;
	if (isPurchaseNotFound(error)) {
		console.warn('Stripe charge refunded for a checkout never fulfilled', charge.id, session.id);
		return;
	}
	throw error;
}

function isPurchaseNotFound(error: { message: string }): boolean {
	return error.message.includes(purchaseNotFoundError);
}

async function checkoutSessionForCharge(
	stripe: Stripe,
	charge: Stripe.Charge
): Promise<Stripe.Checkout.Session | null> {
	const paymentIntentId = paymentIntentIdOf(charge);
	if (paymentIntentId === null) return null;
	const sessions = await stripe.checkout.sessions.list({ payment_intent: paymentIntentId });
	return sessions.data[0] ?? null;
}

function paymentIntentIdOf(charge: Stripe.Charge): string | null {
	const paymentIntent = charge.payment_intent;
	if (paymentIntent === null) return null;
	if (typeof paymentIntent === 'string') return paymentIntent;
	return paymentIntent.id;
}
