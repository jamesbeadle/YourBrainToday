import type { SupabaseClient } from '@supabase/supabase-js';

export type MarketPurchase =
	| { creditBalance: number }
	| 'insufficient_credits'
	| 'account_restricted'
	| 'not_for_sale'
	| 'own_listing'
	| 'already_owned';

const knownRefusals = [
	'insufficient_credits',
	'account_restricted',
	'not_for_sale',
	'own_listing',
	'already_owned'
] as const;

export async function purchaseBrainEdition(
	supabase: SupabaseClient,
	editionId: string
): Promise<MarketPurchase> {
	return purchaseThrough(supabase, 'purchase_brain_edition', { target_edition: editionId });
}

export async function subscribeToBrain(
	supabase: SupabaseClient,
	listingId: string
): Promise<MarketPurchase> {
	return purchaseThrough(supabase, 'subscribe_to_brain', { target_listing: listingId });
}

export async function cancelBrainSubscription(
	supabase: SupabaseClient,
	listingId: string
): Promise<void> {
	const { error } = await supabase.rpc('cancel_brain_subscription', {
		target_listing: listingId
	});
	if (error !== null && !error.message.includes('no_subscription')) throw error;
}

export function marketRefusalMessage(refusal: Exclude<MarketPurchase, { creditBalance: number }>): string {
	const messages: Record<typeof refusal, string> = {
		insufficient_credits: 'You are out of credits — top up on the credits page first.',
		account_restricted: 'This account is currently restricted.',
		not_for_sale: 'This is not for sale right now.',
		own_listing: 'This is your own listing.',
		already_owned: 'You already own this edition.'
	};
	return messages[refusal];
}

async function purchaseThrough(
	supabase: SupabaseClient,
	functionName: string,
	functionArguments: Record<string, string>
): Promise<MarketPurchase> {
	const { data, error } = await supabase.rpc(functionName, functionArguments);
	if (error === null) return { creditBalance: data };
	const refusal = knownRefusals.find((known) => error.message.includes(known));
	if (refusal !== undefined) return refusal;
	throw error;
}
