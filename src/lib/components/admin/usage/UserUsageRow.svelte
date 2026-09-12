<script lang="ts">
	import { formatCount, formatSignedPence } from '$lib/data/usageFormat';
	import { formatPenceAsPounds } from '$lib/data/creditPricing';
	import type { UserUsageSummary } from '$lib/server/admin/usage/summariseUsageByUser';

	let { user }: { user: UserUsageSummary } = $props();

	const marginTone = $derived(user.marginPence < 0 ? 'text-signal' : 'text-go');
	const balanceTone = $derived(user.balance < 0 ? 'text-caution' : '');
</script>

<tr class="transition hover:bg-carriage/40">
	<td class="max-w-64 truncate px-5 py-3 font-display">{user.email}</td>
	<td class="px-5 py-3 text-right tabular-nums">{formatCount(user.creditsBought)}</td>
	<td class="px-5 py-3 text-right tabular-nums">{formatCount(user.creditsGranted)}</td>
	<td class="px-5 py-3 text-right tabular-nums">{formatCount(user.creditsSpent)}</td>
	<td class="px-5 py-3 text-right text-chalk/70 tabular-nums">{formatCount(user.creditsRefunded)}</td>
	<td class="px-5 py-3 text-right tabular-nums {balanceTone}">{formatCount(user.balance)}</td>
	<td class="px-5 py-3 text-right tabular-nums">{formatPenceAsPounds(user.costPence)}</td>
	<td class="px-5 py-3 text-right tabular-nums">{formatPenceAsPounds(user.revenuePence)}</td>
	<td class="px-5 py-3 text-right tabular-nums {marginTone}">{formatSignedPence(user.marginPence)}</td>
</tr>
