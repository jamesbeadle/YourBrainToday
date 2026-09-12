<script lang="ts">
	import MarketLibrary from '$lib/components/market/MarketLibrary.svelte';
	import MarketListingCard from '$lib/components/market/MarketListingCard.svelte';

	let { data } = $props();

	const hasLibrary = $derived(
		data.purchasedEditions.length > 0 || data.subscriptions.length > 0
	);
</script>

<svelte:head>
	<title>Marketplace — Your Brain Today</title>
</svelte:head>

<div class="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10">
	<header class="flex flex-col gap-2">
		<p class="font-display text-sm tracking-widest text-signal uppercase">Marketplace</p>
		<h1 class="font-display text-3xl font-medium">Buy domain knowledge</h1>
		<p class="max-w-prose text-chalk/70">
			Expertise brains other people have built and put up for sale. Buy an edition to keep a
			frozen copy forever, or subscribe for live access as the brain keeps learning. Questions
			you ask cost your own credits, just like your own brains.
		</p>
	</header>
	{#if hasLibrary}
		<MarketLibrary purchasedEditions={data.purchasedEditions} subscriptions={data.subscriptions} />
	{/if}
	{#if data.listings.length === 0}
		<p class="rounded-2xl border border-dashed border-hairline p-8 text-center text-chalk/60">
			Nothing is on the marketplace yet — when someone lists an expertise brain for sale, it appears
			here. You can sell your own from a brain's dashboard.
		</p>
	{:else}
		<section class="flex flex-col gap-3">
			<h2 class="font-display text-xs tracking-widest text-chalk/50 uppercase">On the marketplace</h2>
			<ul class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{#each data.listings as listing (listing.id)}
					<li><MarketListingCard {listing} isMine={listing.ownerId === data.viewerId} /></li>
				{/each}
			</ul>
		</section>
	{/if}
</div>
