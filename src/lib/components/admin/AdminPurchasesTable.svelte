<script lang="ts">
	import { formatBritishDate } from '$lib/data/britishDate';
	import { formatPenceAsPounds } from '$lib/data/creditPricing';
	import type { AdminPurchaseSummary } from '$lib/server/admin/getAdminPurchaseList';

	let { purchases }: { purchases: AdminPurchaseSummary[] } = $props();
</script>

<section class="flex flex-col gap-4">
	<div class="flex flex-col gap-1">
		<h2 class="font-display text-xl font-medium">Purchases</h2>
		<p class="text-sm text-chalk/60">
			Every pack bought through Stripe, newest first. A refunded purchase shows the date its
			credits were taken back.
		</p>
	</div>
	{#if purchases.length === 0}
		<p class="rounded-2xl border border-hairline px-5 py-4 text-sm text-chalk/60">
			No purchases yet.
		</p>
	{:else}
		<div class="overflow-x-auto rounded-2xl border border-hairline">
			<table class="w-full text-sm">
				<thead class="bg-carriage/60 text-left font-display text-xs tracking-widest text-chalk/50 uppercase">
					<tr>
						<th class="px-5 py-3">User</th>
						<th class="px-5 py-3">Session</th>
						<th class="px-5 py-3">Pack</th>
						<th class="px-5 py-3 text-right">Credits</th>
						<th class="px-5 py-3 text-right">Paid</th>
						<th class="px-5 py-3">Date</th>
						<th class="px-5 py-3">Refunded</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-hairline">
					{#each purchases as purchase (purchase.id)}
						<tr class={purchase.refundedAt === null ? '' : 'text-chalk/50'}>
							<td class="px-5 py-3 font-display">{purchase.email}</td>
							<td class="max-w-56 truncate px-5 py-3 font-mono text-xs" title={purchase.checkoutSessionId}>
								{purchase.checkoutSessionId}
							</td>
							<td class="px-5 py-3 capitalize">{purchase.packId}</td>
							<td class="px-5 py-3 text-right">{purchase.credits}</td>
							<td class="px-5 py-3 text-right">{formatPenceAsPounds(purchase.amountPence)}</td>
							<td class="px-5 py-3">{formatBritishDate(purchase.purchasedAt)}</td>
							<td class="px-5 py-3">
								{purchase.refundedAt === null ? '—' : formatBritishDate(purchase.refundedAt)}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</section>
