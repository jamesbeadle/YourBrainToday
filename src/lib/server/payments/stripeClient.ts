import Stripe from 'stripe';
import { env } from '$env/dynamic/private';

export function stripeClient(): Stripe | null {
	const secretKey = env.STRIPE_SECRET_KEY ?? '';
	if (!secretKey.startsWith('sk_')) return null;
	return new Stripe(secretKey);
}
