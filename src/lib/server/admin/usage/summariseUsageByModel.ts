import { creditValuePence } from '$lib/data/creditPacks';
import { rungFor } from '$lib/data/modelLadder';
import type { ModelUsageRow } from './getModelUsageRows';

export type ModelUsageSummary = {
	modelId: string;
	modelName: string;
	callCount: number;
	inputTokens: number;
	outputTokens: number;
	cacheReadTokens: number;
	cacheWriteTokens: number;
	costPence: number;
	creditsCharged: number;
	revenuePence: number;
};

export function summariseUsageByModel(usageRows: ModelUsageRow[]): ModelUsageSummary[] {
	const summaries = new Map<string, ModelUsageSummary>();
	for (const row of usageRows) {
		const summary = summaries.get(row.modelId) ?? emptySummary(row.modelId);
		summaries.set(row.modelId, addRow(summary, row));
	}
	return [...summaries.values()].sort((first, second) => second.costPence - first.costPence);
}

function addRow(summary: ModelUsageSummary, row: ModelUsageRow): ModelUsageSummary {
	const creditsCharged = summary.creditsCharged + row.creditsCharged;
	return {
		...summary,
		callCount: summary.callCount + 1,
		inputTokens: summary.inputTokens + row.inputTokens,
		outputTokens: summary.outputTokens + row.outputTokens,
		cacheReadTokens: summary.cacheReadTokens + row.cacheReadTokens,
		cacheWriteTokens: summary.cacheWriteTokens + row.cacheWriteTokens,
		costPence: summary.costPence + row.costPence,
		creditsCharged,
		revenuePence: creditsCharged * creditValuePence
	};
}

function emptySummary(modelId: string): ModelUsageSummary {
	return {
		modelId,
		modelName: rungFor(modelId).name,
		callCount: 0,
		inputTokens: 0,
		outputTokens: 0,
		cacheReadTokens: 0,
		cacheWriteTokens: 0,
		costPence: 0,
		creditsCharged: 0,
		revenuePence: 0
	};
}
