<script lang="ts">
	import { formatPenceAsPounds } from '$lib/data/creditPricing';
	import type { Purchase } from '$lib/server/credits/getPurchaseHistory';

	let { purchases }: { purchases: Purchase[] } = $props();

	function formatPurchaseDate(isoDate: string): string {
		return new Date(isoDate).toLocaleDateString('en-GB', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	}
</script>

<section class="flex flex-col gap-3">
	<h2 class="font-display text-xl font-medium">Purchases</h2>
	{#if purchases.length === 0}
		<p class="rounded-2xl border border-dashed border-hairline p-6 text-chalk/60">
			No purchases yet — your welcome credits are on the house.
		</p>
	{:else}
		<ul class="flex flex-col divide-y divide-hairline rounded-2xl border border-hairline">
			{#each purchases as purchase (purchase.id)}
				<li class="flex items-center justify-between gap-4 px-5 py-4">
					<div>
						<p class="font-display capitalize">{purchase.packId} pack</p>
						<p class="text-xs text-chalk/50">{formatPurchaseDate(purchase.purchasedAt)}</p>
					</div>
					<div class="text-right">
						<p class="font-display text-go">+{purchase.credits} credits</p>
						<p class="text-xs text-chalk/50">{formatPenceAsPounds(purchase.amountPence)} · test mode</p>
					</div>
				</li>
			{/each}
		</ul>
	{/if}
</section>
