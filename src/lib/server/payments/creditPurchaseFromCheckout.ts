import type Stripe from 'stripe';
import { supabaseServiceClient } from './supabaseServiceClient';

const paidStatus: Stripe.Checkout.Session.PaymentStatus = 'paid';

export function isCheckoutPaid(session: Stripe.Checkout.Session): boolean {
	return session.payment_status === paidStatus;
}

export async function creditPurchaseFromCheckout(
	session: Stripe.Checkout.Session
): Promise<void> {
	if (!isCheckoutPaid(session)) return;
	const userId = session.client_reference_id;
	const packId = session.metadata?.packId;
	if (!userId || !packId) {
		console.warn('Stripe checkout session is not a credit pack purchase', session.id);
		return;
	}
	const supabase = supabaseServiceClient();
	const { error } = await supabase.rpc('complete_stripe_purchase', {
		user_identifier: userId,
		pack_identifier: packId,
		checkout_session_identifier: session.id
	});
	if (error) throw error;
}
