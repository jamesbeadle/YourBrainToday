import { emptyUsage, type AnthropicUsage, type MeteredCall } from '$lib/data/anthropicUsage';
import { meteredCallsSoFar, runWithModelResolver } from '$lib/server/anthropic/modelContext';

export type Metered<T> = {
	value: T;
	usage: AnthropicUsage;
	callCount: number;
	latencyMilliseconds: number;
};

// Every Anthropic call made inside run lands in the model context, so the
// arm's whole cost — however many rounds it took — is read back at the end.
export async function runMetered<T>(model: string, run: () => Promise<T>): Promise<Metered<T>> {
	const startedAt = Date.now();
	return runWithModelResolver(
		async () => model,
		async () => {
			const value = await run();
			const calls = meteredCallsSoFar();
			return {
				value,
				usage: sumUsage(calls),
				callCount: calls.length,
				latencyMilliseconds: Date.now() - startedAt
			};
		}
	);
}

function sumUsage(calls: MeteredCall[]): AnthropicUsage {
	return calls.reduce(
		(total, call) => ({
			inputTokens: total.inputTokens + call.usage.inputTokens,
			outputTokens: total.outputTokens + call.usage.outputTokens,
			cacheReadTokens: total.cacheReadTokens + call.usage.cacheReadTokens,
			cacheWriteTokens: total.cacheWriteTokens + call.usage.cacheWriteTokens
		}),
		emptyUsage
	);
}
