<script lang="ts">
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { enhance } from '$app/forms';
	import type { BrainEdition } from '$lib/data/marketTypes';

	let {
		edition,
		priceCredits,
		isOwned,
		canBuy
	}: {
		edition: BrainEdition;
		priceCredits: number | null;
		isOwned: boolean;
		canBuy: boolean;
	} = $props();

	const tracker = new FormTracker();

	function formatPublishedDate(isoDate: string): string {
		return new Date(isoDate).toLocaleDateString('en-GB', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	}
</script>

<li class="flex flex-col gap-2 rounded-2xl border border-hairline bg-carriage p-4">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div class="flex flex-col">
			<span class="font-display text-sm text-chalk">v{edition.version} — {edition.name}</span>
			<span class="text-xs text-chalk/50">
				Frozen {formatPublishedDate(edition.publishedAt)}
			</span>
		</div>
		{#if isOwned}
			<span class="rounded-full border border-go/50 px-3 py-1 font-display text-xs text-go">
				In your library
			</span>
		{:else if priceCredits !== null}
			<form method="POST" action="?/buyEdition" use:enhance={tracker.submit()}>
				<input type="hidden" name="editionId" value={edition.id} />
				<SubmitButton
					isSaving={tracker.isSaving}
					disabled={!canBuy}
					savingLabel="Buying…"
					class="rounded-full bg-signal px-5 py-2 font-display text-xs font-medium text-night
						transition hover:brightness-110 disabled:opacity-40"
				>
					Buy for {priceCredits} credits
				</SubmitButton>
			</form>
		{/if}
	</div>
	<FormErrorNote message={tracker.errorMessage} />
</li>
