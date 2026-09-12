<script lang="ts">
	import type { BrainListing } from '$lib/data/marketTypes';

	let { listing, isMine = false }: { listing: BrainListing; isMine?: boolean } = $props();
</script>

<a
	href={`/market/${listing.id}`}
	class="group flex h-full flex-col gap-2 rounded-2xl border border-hairline bg-carriage p-6
		transition hover:border-signal/60"
>
	<div class="flex items-start justify-between gap-3">
		<p class="font-display text-lg font-medium transition group-hover:text-signal">
			{listing.headline}
		</p>
		{#if isMine}
			<span
				class="shrink-0 rounded-full border border-signal/50 px-3 py-1 font-display text-xs
					text-signal"
			>
				Your listing
			</span>
		{/if}
	</div>
	{#if listing.description !== ''}
		<p class="line-clamp-3 text-sm text-chalk/60">{listing.description}</p>
	{/if}
	<div class="mt-auto flex flex-wrap gap-x-4 gap-y-1 pt-2 text-xs text-chalk/50">
		{#if listing.editionPriceCredits !== null}
			<span>Edition · {listing.editionPriceCredits} credits</span>
		{/if}
		{#if listing.subscriptionPriceCredits !== null}
			<span>Subscription · {listing.subscriptionPriceCredits} credits / 30 days</span>
		{/if}
		{#if listing.ownerName !== ''}
			<span class="basis-full">Sold by {listing.ownerName}</span>
		{/if}
	</div>
</a>
