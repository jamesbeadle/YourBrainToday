<script lang="ts">
	import EditionList from './EditionList.svelte';
	import ListingForm from './ListingForm.svelte';
	import { invalidateAll } from '$app/navigation';
	import { requestListingPublish } from './sellRequests';
	import type { BrainEdition, BrainListing, ListingSales } from '$lib/data/marketTypes';

	let {
		brainId,
		listing,
		editions,
		sales
	}: {
		brainId: string;
		listing: BrainListing | null;
		editions: BrainEdition[];
		sales: ListingSales | null;
	} = $props();

	let isToggling = $state(false);

	async function togglePublished() {
		if (listing === null || isToggling) return;
		isToggling = true;
		await requestListingPublish(brainId, !listing.isPublished);
		isToggling = false;
		await invalidateAll();
	}
</script>

<div class="flex flex-col gap-4 p-4">
	<p class="text-sm text-chalk/60">
		Sell this brain on the market. Buyers pay you in credits — an edition is a frozen copy they
		keep forever, a subscription is 30 days of live access at a time. Either way they ask
		questions on their own credits. Buyers see your display name from
		<a href="/account" class="underline transition hover:text-chalk">your account</a>, never your
		email address — saving the listing picks up the latest name.
	</p>
	<ListingForm {brainId} {listing} />
	{#if listing !== null}
		<div class="flex items-center justify-between rounded-xl border border-hairline px-3 py-2">
			<span class="text-sm {listing.isPublished ? 'text-go' : 'text-chalk/60'}">
				{listing.isPublished ? 'On the market' : 'Not on the market yet'}
			</span>
			<button
				type="button"
				onclick={togglePublished}
				disabled={isToggling}
				class="rounded-full border border-hairline px-4 py-1.5 font-display text-xs
					text-chalk/70 transition hover:border-chalk/40 hover:text-chalk disabled:opacity-40"
			>
				{listing.isPublished ? 'Take off the market' : 'Put on the market'}
			</button>
		</div>
		{#if sales !== null && (sales.editionSaleCount > 0 || sales.activeSubscriberCount > 0)}
			<p class="text-xs text-chalk/50">
				{sales.editionSaleCount} edition {sales.editionSaleCount === 1 ? 'sale' : 'sales'} ·
				{sales.activeSubscriberCount} active
				{sales.activeSubscriberCount === 1 ? 'subscriber' : 'subscribers'}
			</p>
		{/if}
		<div class="flex flex-col gap-2">
			<h3 class="font-display text-xs tracking-widest text-chalk/50 uppercase">Editions</h3>
			<EditionList {brainId} {editions} />
		</div>
	{/if}
</div>
