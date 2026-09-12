import { getProfileEmails } from './usage/getProfileEmails';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';

export type AdminPurchaseSummary = {
	id: string;
	email: string;
	checkoutSessionId: string;
	packId: string;
	credits: number;
	amountPence: number;
	purchasedAt: string;
	refundedAt: string | null;
};

const unknownEmail = '(deleted account)';

// Purchases belong to every user at once, so the read runs on the service
// role; the route has already required an admin.
export async function getAdminPurchaseList(): Promise<AdminPurchaseSummary[]> {
	const service = supabaseServiceClient();
	const [emails, { data, error }] = await Promise.all([
		getProfileEmails(service),
		service
			.from('purchases')
			.select(
				'id, user_id, pack_id, credits, amount_pence, stripe_checkout_session_id, created_at, refunded_at'
			)
			.order('created_at', { ascending: false })
	]);
	if (error !== null) throw error;
	return data.map((row) => ({
		id: row.id,
		email: emails.get(row.user_id) ?? unknownEmail,
		checkoutSessionId: row.stripe_checkout_session_id,
		packId: row.pack_id,
		credits: row.credits,
		amountPence: row.amount_pence,
		purchasedAt: row.created_at,
		refundedAt: row.refunded_at
	}));
}
