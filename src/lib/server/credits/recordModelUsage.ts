import { usageCostPence } from '$lib/data/creditPricing';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import type { MeteredCall } from '$lib/data/anthropicUsage';

export type ModelUsageSettlement = {
	payerId: string;
	reason: string;
	chatbotId?: string;
	calls: MeteredCall[];
	creditsCharged: number;
	hasFailedSettlement: boolean;
};

const modelUsageTable = 'model_usage';

// One row per metered call. The credits a job charged are one number for
// the whole job, so each call carries its share of them in proportion to
// its cost; the rows always sum back to what the ledger took. Recording
// must never turn a delivered answer into a failure, so a write that fails
// is reported and the settlement stands.
export async function recordModelUsage(settlement: ModelUsageSettlement): Promise<void> {
	if (settlement.calls.length === 0) return;
	try {
		const { error } = await supabaseServiceClient()
			.from(modelUsageTable)
			.insert(usageRowsFor(settlement));
		if (error !== null) throw error;
	} catch (failure) {
		console.error('Recording model usage failed', settlement.reason, failure);
	}
}

function usageRowsFor(settlement: ModelUsageSettlement): Record<string, unknown>[] {
	const costs = settlement.calls.map((call) => usageCostPence(call.modelId, call.usage));
	const creditShares = apportionCredits(settlement.creditsCharged, costs);
	return settlement.calls.map((call, index) => ({
		user_id: settlement.payerId,
		reason: settlement.reason,
		chatbot_id: settlement.chatbotId ?? null,
		model_id: call.modelId,
		input_tokens: call.usage.inputTokens,
		output_tokens: call.usage.outputTokens,
		cache_read_tokens: call.usage.cacheReadTokens,
		cache_write_tokens: call.usage.cacheWriteTokens,
		cost_pence: costs[index],
		credits_charged: creditShares[index],
		has_failed_settlement: settlement.hasFailedSettlement
	}));
}

function apportionCredits(creditsCharged: number, costs: number[]): number[] {
	const totalCost = costs.reduce((total, cost) => total + cost, 0);
	const shares = costs.map((cost) =>
		totalCost === 0 ? 0 : Math.floor((creditsCharged * cost) / totalCost)
	);
	const remainder = creditsCharged - shares.reduce((total, share) => total + share, 0);
	shares[shares.length - 1] += remainder;
	return shares;
}
