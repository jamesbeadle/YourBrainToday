<script lang="ts">
	import EditionPurchaseRow from '$lib/components/market/EditionPurchaseRow.svelte';
	import SubscriptionPanel from '$lib/components/market/SubscriptionPanel.svelte';

	let { data } = $props();

	const canBuy = $derived(!data.isOwnListing);
</script>

<svelte:head>
	<title>{data.listing.headline} — Market — Your Brain Today</title>
</svelte:head>

<div class="mx-auto flex max-w-4xl flex-col gap-8 px-6 py-16">
	<div class="flex flex-col gap-2">
		<a href="/market" class="font-display text-xs text-chalk/50 transition hover:text-chalk">
			← The market
		</a>
		<h1 class="font-display text-3xl font-medium">{data.listing.headline}</h1>
		{#if data.listing.ownerName !== ''}
			<p class="text-sm text-chalk/50">Sold by {data.listing.ownerName}</p>
		{/if}
		{#if data.listing.description !== ''}
			<p class="max-w-prose text-chalk/70">{data.listing.description}</p>
		{/if}
		{#if data.isOwnListing}
			<p class="rounded-2xl border border-signal/40 bg-signal/10 px-5 py-4 text-sm text-chalk/80">
				This is your listing exactly as buyers see it — the buy buttons are switched off for
				you because you can't buy your own brain. Manage prices and editions from the brain's
				dashboard.
			</p>
		{/if}
	</div>
	{#if data.listing.subscriptionPriceCredits !== null}
		<SubscriptionPanel
			priceCredits={data.listing.subscriptionPriceCredits}
			subscription={data.mine.subscription}
			{canBuy}
		/>
	{/if}
	{#if data.listing.editionPriceCredits !== null}
		<section class="flex flex-col gap-3">
			<div class="flex flex-col gap-1">
				<h2 class="font-display text-base font-medium">Editions</h2>
				<p class="text-sm text-chalk/60">
					An edition is the brain frozen at a point in time. Buy one and it is yours to read
					and question forever — it never changes after purchase.
				</p>
			</div>
			{#if data.editions.length === 0}
				<p class="rounded-2xl border border-dashed border-hairline p-6 text-center text-sm text-chalk/50">
					No editions published yet — subscribe for live access, or check back soon.
				</p>
			{:else}
				<ul class="flex flex-col gap-3">
					{#each data.editions as edition (edition.id)}
						<EditionPurchaseRow
							{edition}
							priceCredits={data.listing.editionPriceCredits}
							isOwned={data.mine.ownedEditionIds.includes(edition.id)}
							{canBuy}
						/>
					{/each}
				</ul>
			{/if}
		</section>
	{/if}
	{#if data.mine.ownedEditionIds.length > 0 || data.mine.subscription !== null}
		<p class="text-sm text-chalk/50">
			Everything you own is in <a href="/market" class="underline transition hover:text-chalk">your library</a>
			— open a brain there to explore it and ask questions on your credits.
		</p>
	{/if}
</div>
