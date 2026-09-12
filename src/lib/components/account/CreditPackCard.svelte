<script lang="ts">
	import { enhance } from '$app/forms';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { formatPenceAsPounds } from '$lib/data/creditPricing';
	import type { CreditPack } from '$lib/server/credits/getCreditPacks';

	let {
		creditPack,
		isMostPopular,
		isCheckoutLive
	}: { creditPack: CreditPack; isMostPopular: boolean; isCheckoutLive: boolean } = $props();

	const tracker = new FormTracker();
</script>

<article
	class={`relative flex flex-col gap-4 rounded-2xl border bg-carriage p-6
		${isMostPopular ? 'border-go' : 'border-hairline'}`}
>
	{#if isMostPopular}
		<p
			class="absolute -top-3 right-5 rounded-full bg-go px-3 py-0.5 font-display text-xs
				font-medium text-night"
		>
			Most popular
		</p>
	{/if}
	<h2 class="font-display text-xl font-medium">{creditPack.name}</h2>
	<p class="font-display text-4xl font-medium">
		{creditPack.credits}
		<span class="text-base font-normal text-chalk/60">credits</span>
	</p>
	<p class="text-chalk/70">{formatPenceAsPounds(creditPack.pricePence)}</p>
	<form method="POST" action="?/buy" use:enhance={tracker.submit()} class="mt-auto flex flex-col gap-3">
		<input type="hidden" name="packId" value={creditPack.id} />
		<FormErrorNote message={tracker.errorMessage} />
		<SubmitButton
			isSaving={tracker.isSaving}
			disabled={!isCheckoutLive}
			savingLabel="Opening checkout…"
			class="w-full rounded-full bg-signal px-6 py-3 font-display text-sm font-medium text-night
				transition hover:brightness-110 disabled:opacity-40 disabled:hover:brightness-100"
		>
			{isCheckoutLive ? 'Buy with Stripe' : 'Coming soon'}
		</SubmitButton>
	</form>
</article>
