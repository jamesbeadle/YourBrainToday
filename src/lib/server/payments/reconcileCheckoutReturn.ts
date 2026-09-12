import type Stripe from 'stripe';
import { creditPurchaseFromCheckout, isCheckoutPaid } from './creditPurchaseFromCheckout';

export type CheckoutOutcome = 'credited' | 'pending' | 'cancelled' | null;

const checkoutParameter = 'checkout';
const sessionParameter = 'session_id';
const expiredStatus: Stripe.Checkout.Session.Status = 'expired';

export const creditedReturnPath = `/account/credits?${checkoutParameter}=credited`;

export function isReturningFromStripe(searchParams: URLSearchParams): boolean {
	return searchParams.has(sessionParameter);
}

export async function reconcileCheckoutReturn(
	searchParams: URLSearchParams,
	stripe: Stripe | null,
	userId: string
): Promise<CheckoutOutcome> {
	const checkoutState = searchParams.get(checkoutParameter);
	if (checkoutState === 'cancelled') return 'cancelled';
	if (checkoutState === 'credited') return 'credited';
	if (checkoutState !== 'success') return null;
	const sessionId = searchParams.get(sessionParameter);
	if (stripe === null || sessionId === null) return 'pending';
	return outcomeOfSession(stripe, sessionId, userId);
}

async function outcomeOfSession(
	stripe: Stripe,
	sessionId: string,
	userId: string
): Promise<CheckoutOutcome> {
	const session = await retrieveSession(stripe, sessionId);
	if (session === null) return 'pending';
	if (session.client_reference_id !== userId) return null;
	if (session.status === expiredStatus) return 'cancelled';
	if (!isCheckoutPaid(session)) return 'pending';
	return creditNow(session);
}

async function retrieveSession(
	stripe: Stripe,
	sessionId: string
): Promise<Stripe.Checkout.Session | null> {
	try {
		return await stripe.checkout.sessions.retrieve(sessionId);
	} catch {
		return null;
	}
}

async function creditNow(session: Stripe.Checkout.Session): Promise<CheckoutOutcome> {
	try {
		await creditPurchaseFromCheckout(session);
		return 'credited';
	} catch (failure) {
		console.error('Success-page fulfilment failed; the webhook will credit it', failure);
		return 'pending';
	}
}
