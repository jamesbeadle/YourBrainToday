<script lang="ts">
	import CheckoutOutcomeNote from '$lib/components/account/CheckoutOutcomeNote.svelte';
	import CreditPackCard from '$lib/components/account/CreditPackCard.svelte';
	import SendCreditsPanel from '$lib/components/account/SendCreditsPanel.svelte';

	let { data, form } = $props();
</script>

<svelte:head>
	<title>Credits — Your Brain Today</title>
</svelte:head>

<div class="mx-auto flex max-w-4xl flex-col gap-8 px-6 py-16">
	<div class="flex flex-col gap-2">
		<h1 class="font-display text-3xl font-medium">Credits</h1>
		<p class="max-w-prose text-chalk/70">
			Credits pay for the work your second brain does — reading documents, answering questions,
			and holding conversations grounded
			in your own records.
		</p>
	</div>
	{#if !data.isCheckoutLive}
		<p class="rounded-2xl border border-signal/40 bg-signal/10 px-5 py-4 text-chalk/80">
			Early access: credit packs can't be bought yet. The Your Brain Today team grants
			credits directly to your account —
			<a href="/contact" class="text-chalk underline underline-offset-4 hover:text-signal">
				get in touch
			</a>
			and we'll top you up.
		</p>
	{/if}
	<CheckoutOutcomeNote outcome={data.checkoutOutcome} />
	{#if form?.message}
		<p class="rounded-2xl border border-caution/50 bg-caution/10 px-5 py-4 text-caution">
			{form.message}
		</p>
	{/if}
	<div class="grid gap-6 md:grid-cols-3">
		{#each data.creditPacks as creditPack (creditPack.id)}
			<CreditPackCard
				{creditPack}
				isMostPopular={creditPack.id === 'growth'}
				isCheckoutLive={data.isCheckoutLive}
			/>
		{/each}
	</div>
	<p class="text-sm text-chalk/50">
		{#if data.isCheckoutLive}
			You'll be taken to Stripe to pay. Every purchase lands in your credit ledger the moment it
			completes.
		{:else}
			Prices shown are what packs will cost once checkout opens.
		{/if}
	</p>
	<p class="text-sm text-chalk/50">
		Unused packs can be refunded within 14 days of purchase — the full promise is in our
		<a href="/terms" class="text-chalk/80 underline underline-offset-4 hover:text-chalk">
			terms of service</a
		>.
	</p>
	<SendCreditsPanel />
</div>
