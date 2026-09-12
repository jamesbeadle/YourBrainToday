import type Stripe from 'stripe';
import type { CreditPack } from '$lib/server/credits/getCreditPacks';

const checkoutReturnPath = '/account/credits';

export async function createCheckoutSession(
	stripe: Stripe,
	creditPack: CreditPack,
	userId: string,
	origin: string
): Promise<string> {
	const session = await stripe.checkout.sessions.create({
		mode: 'payment',
		client_reference_id: userId,
		metadata: { packId: creditPack.id },
		line_items: [
			{
				quantity: 1,
				price_data: {
					currency: 'gbp',
					unit_amount: creditPack.pricePence,
					product_data: { name: `${creditPack.name} — ${creditPack.credits} credits` }
				}
			}
		],
		success_url: `${origin}${checkoutReturnPath}?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
		cancel_url: `${origin}${checkoutReturnPath}?checkout=cancelled`
	});
	if (session.url === null) throw new Error('checkout_session_missing_url');
	return session.url;
}
