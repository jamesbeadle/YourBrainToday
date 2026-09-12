<script lang="ts">
	import UsageFigure from './UsageFigure.svelte';
	import { formatCount, formatSignedPence } from '$lib/data/usageFormat';
	import { formatPenceAsPounds } from '$lib/data/creditPricing';
	import type { UsageTotals } from '$lib/server/admin/usage/summariseUsageTotals';

	let { totals }: { totals: UsageTotals } = $props();

	const marginTone = $derived(totals.marginPence < 0 ? 'text-signal' : 'text-go');
	const failureTone = $derived(totals.failedSettlementCallCount > 0 ? 'text-caution' : '');
</script>

<dl class="grid gap-px overflow-hidden rounded-2xl border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-5">
	<UsageFigure label="Claude cost" value={formatPenceAsPounds(totals.costPence)} />
	<UsageFigure label="Revenue at pack value" value={formatPenceAsPounds(totals.revenuePence)} />
	<UsageFigure label="Margin" value={formatSignedPence(totals.marginPence)} tone={marginTone} />
	<UsageFigure label="Metered calls" value={formatCount(totals.callCount)} />
	<UsageFigure
		label="Settlement failures"
		value={formatCount(totals.failedSettlementCallCount)}
		detail={`${formatPenceAsPounds(totals.failedSettlementCostPence)} of cost not settled`}
		tone={failureTone}
	/>
</dl>
