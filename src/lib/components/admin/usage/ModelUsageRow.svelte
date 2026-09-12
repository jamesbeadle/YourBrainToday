<script lang="ts">
	import { formatCount, formatSignedPence } from '$lib/data/usageFormat';
	import { formatPenceAsPounds } from '$lib/data/creditPricing';
	import type { ModelUsageSummary } from '$lib/server/admin/usage/summariseUsageByModel';

	let { model }: { model: ModelUsageSummary } = $props();

	const marginPence = $derived(model.revenuePence - model.costPence);
	const marginTone = $derived(marginPence < 0 ? 'text-signal' : 'text-go');
</script>

<tr class="transition hover:bg-carriage/40">
	<td class="px-5 py-3">
		<p class="font-display">{model.modelName}</p>
		<p class="text-xs text-chalk/50">{model.modelId}</p>
	</td>
	<td class="px-5 py-3 text-right tabular-nums">{formatCount(model.callCount)}</td>
	<td class="px-5 py-3 text-right tabular-nums">{formatCount(model.inputTokens)}</td>
	<td class="px-5 py-3 text-right tabular-nums">{formatCount(model.outputTokens)}</td>
	<td class="px-5 py-3 text-right text-chalk/70 tabular-nums">{formatCount(model.cacheReadTokens)}</td>
	<td class="px-5 py-3 text-right text-chalk/70 tabular-nums">{formatCount(model.cacheWriteTokens)}</td>
	<td class="px-5 py-3 text-right tabular-nums">{formatPenceAsPounds(model.costPence)}</td>
	<td class="px-5 py-3 text-right tabular-nums">{formatCount(model.creditsCharged)}</td>
	<td class="px-5 py-3 text-right tabular-nums {marginTone}">{formatSignedPence(marginPence)}</td>
</tr>
