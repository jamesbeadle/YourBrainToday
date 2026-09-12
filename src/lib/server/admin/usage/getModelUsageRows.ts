import type { SupabaseClient } from '@supabase/supabase-js';

export type ModelUsageRow = {
	userId: string;
	modelId: string;
	inputTokens: number;
	outputTokens: number;
	cacheReadTokens: number;
	cacheWriteTokens: number;
	costPence: number;
	creditsCharged: number;
	hasFailedSettlement: boolean;
};

const usageColumns =
	'user_id, model_id, input_tokens, output_tokens, cache_read_tokens, cache_write_tokens, cost_pence, credits_charged, has_failed_settlement';

export async function getModelUsageRows(
	service: SupabaseClient,
	since: Date
): Promise<ModelUsageRow[]> {
	const { data, error } = await service
		.from('model_usage')
		.select(usageColumns)
		.gte('created_at', since.toISOString());
	if (error !== null) throw error;
	return data.map((row) => ({
		userId: row.user_id,
		modelId: row.model_id,
		inputTokens: row.input_tokens,
		outputTokens: row.output_tokens,
		cacheReadTokens: row.cache_read_tokens,
		cacheWriteTokens: row.cache_write_tokens,
		costPence: Number(row.cost_pence),
		creditsCharged: row.credits_charged,
		hasFailedSettlement: row.has_failed_settlement
	}));
}
