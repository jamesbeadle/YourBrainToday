import type Stripe from 'stripe';
import { creditPurchaseFromCheckout } from './creditPurchaseFromCheckout';
import { reversePurchaseFromRefund } from './reversePurchaseFromRefund';

export async function handleStripeEvent(stripe: Stripe, stripeEvent: Stripe.Event): Promise<void> {
	switch (stripeEvent.type) {
		case 'checkout.session.completed':
		case 'checkout.session.async_payment_succeeded':
			return creditPurchaseFromCheckout(stripeEvent.data.object);
		case 'checkout.session.async_payment_failed':
		case 'checkout.session.expired':
			return logCheckoutNotPaid(stripeEvent.type, stripeEvent.data.object);
		case 'charge.refunded':
			return reversePurchaseFromRefund(stripe, stripeEvent.data.object);
		default:
			return;
	}
}

function logCheckoutNotPaid(eventType: string, session: Stripe.Checkout.Session): void {
	console.warn(
		JSON.stringify({
			level: 'warn',
			event: eventType,
			checkoutSessionId: session.id,
			userId: session.client_reference_id,
			packId: session.metadata?.packId ?? null
		})
	);
}
