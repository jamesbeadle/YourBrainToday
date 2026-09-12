<script lang="ts">
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { enhance } from '$app/forms';
	import type { MyListingPurchases } from '$lib/server/market/getMyListingPurchases';

	let {
		priceCredits,
		subscription,
		canBuy
	}: {
		priceCredits: number;
		subscription: MyListingPurchases['subscription'];
		canBuy: boolean;
	} = $props();

	const subscribeTracker = new FormTracker();
	const cancelTracker = new FormTracker();

	const isRunning = $derived(
		subscription !== null && new Date(subscription.currentPeriodEnd).getTime() > Date.now()
	);
	const subscribeLabel = $derived(
		subscription === null ? `Subscribe for ${priceCredits} credits` : `Renew for ${priceCredits} credits`
	);

	function formatDay(isoDate: string): string {
		return new Date(isoDate).toLocaleDateString('en-GB', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	}
</script>

<div class="flex flex-col gap-3 rounded-2xl border border-hairline bg-carriage p-5">
	<div class="flex flex-col gap-1">
		<h2 class="font-display text-base font-medium">Live subscription</h2>
		<p class="text-sm text-chalk/60">
			{priceCredits} credits buys 30 days of live access — the brain keeps learning and you keep
			reading. Renew whenever you like; each renewal adds 30 days.
		</p>
	</div>
	{#if subscription !== null}
		<p class="text-sm {isRunning ? 'text-go' : 'text-caution'}">
			{#if isRunning && subscription.status === 'cancelled'}
				Cancelled — access until {formatDay(subscription.currentPeriodEnd)}.
			{:else if isRunning}
				Active until {formatDay(subscription.currentPeriodEnd)}.
			{:else}
				Lapsed on {formatDay(subscription.currentPeriodEnd)} — renew to read again.
			{/if}
		</p>
	{/if}
	<div class="flex flex-wrap items-center gap-2">
		<form method="POST" action="?/subscribe" use:enhance={subscribeTracker.submit()}>
			<SubmitButton
				isSaving={subscribeTracker.isSaving}
				disabled={!canBuy}
				savingLabel="Subscribing…"
				class="rounded-full bg-signal px-5 py-2 font-display text-xs font-medium text-night
					transition hover:brightness-110 disabled:opacity-40"
			>
				{subscribeLabel}
			</SubmitButton>
		</form>
		{#if canBuy && isRunning && subscription?.status === 'active'}
			<form method="POST" action="?/cancelSubscription" use:enhance={cancelTracker.submit()}>
				<SubmitButton
					isSaving={cancelTracker.isSaving}
					savingLabel="Cancelling…"
					class="rounded-full border border-hairline px-5 py-2 font-display text-xs
						text-chalk/70 transition hover:border-chalk/40 hover:text-chalk"
				>
					Cancel — keep access until the period ends
				</SubmitButton>
			</form>
		{/if}
	</div>
	<FormErrorNote message={subscribeTracker.errorMessage ?? cancelTracker.errorMessage} />
</div>
