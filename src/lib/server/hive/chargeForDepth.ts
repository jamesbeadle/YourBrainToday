import type { SupabaseClient } from '@supabase/supabase-js';
import { tradeTalkDepthCreditsFor } from '$lib/data/creditPricing';
import { refundCredits, spendCredits } from '$lib/server/credits/spendCredits';

export type DepthCharge = { creditBalance: number | null; creditsCharged: number };

export const tradeTalkDepthReason = 'trade_talk_depth';

export const noDepthCharge: DepthCharge = { creditBalance: null, creditsCharged: 0 };

export async function chargeForDepth(
	supabase: SupabaseClient,
	pagesReadCounts: Map<string, number>
): Promise<DepthCharge> {
	const totalPagesRead = [...pagesReadCounts.values()].reduce((total, count) => total + count, 0);
	const depthCost = tradeTalkDepthCreditsFor(totalPagesRead);
	if (depthCost === 0) return noDepthCharge;
	const depthSpend = await spendCredits(supabase, depthCost, tradeTalkDepthReason);
	if (typeof depthSpend === 'string') return noDepthCharge;
	return { creditBalance: depthSpend.creditBalance, creditsCharged: depthCost };
}

export async function refundDepthCharge(payerId: string, charge: DepthCharge): Promise<void> {
	if (charge.creditsCharged === 0) return;
	await refundCredits(payerId, charge.creditsCharged, tradeTalkDepthReason);
}
