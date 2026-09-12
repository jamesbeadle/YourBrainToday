<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { requestListingSave } from './sellRequests';
	import type { BrainListing } from '$lib/data/marketTypes';

	let { brainId, listing }: { brainId: string; listing: BrainListing | null } = $props();

	let headline = $derived(listing?.headline ?? '');
	let description = $derived(listing?.description ?? '');
	let editionPriceCredits = $derived(priceText(listing?.editionPriceCredits));
	let subscriptionPriceCredits = $derived(priceText(listing?.subscriptionPriceCredits));
	let isSaving = $state(false);
	let notice = $state<{ tone: 'go' | 'caution'; message: string } | null>(null);

	function priceText(price: number | null | undefined): string {
		return price == null ? '' : String(price);
	}

	async function save(event: SubmitEvent) {
		event.preventDefault();
		if (isSaving) return;
		isSaving = true;
		notice = null;
		const outcome = await requestListingSave(brainId, {
			headline,
			description,
			editionPriceCredits,
			subscriptionPriceCredits
		});
		isSaving = false;
		if (!outcome.isSaved) return void (notice = { tone: 'caution', message: outcome.message });
		notice = { tone: 'go', message: 'Listing saved.' };
		await invalidateAll();
	}

	const inputClasses = `rounded-xl border border-hairline bg-night px-3 py-2 text-sm text-chalk
		placeholder-chalk/30 outline-none focus:border-chalk/40`;
</script>

<form onsubmit={save} class="flex flex-col gap-2">
	<input bind:value={headline} placeholder="Listing headline" class={inputClasses} />
	<textarea
		bind:value={description}
		rows="3"
		placeholder="What does this brain know, and who is it for?"
		class={inputClasses}
	></textarea>
	<div class="grid grid-cols-2 gap-2">
		<label class="flex flex-col gap-1 text-xs text-chalk/60">
			Edition price (credits)
			<input
				bind:value={editionPriceCredits}
				type="number"
				min="1"
				placeholder="Not for sale"
				class={inputClasses}
			/>
		</label>
		<label class="flex flex-col gap-1 text-xs text-chalk/60">
			Subscription / 30 days
			<input
				bind:value={subscriptionPriceCredits}
				type="number"
				min="1"
				placeholder="Not offered"
				class={inputClasses}
			/>
		</label>
	</div>
	<button
		type="submit"
		disabled={isSaving}
		class="rounded-full bg-signal px-5 py-2 font-display text-xs font-medium text-night
			transition hover:brightness-110 disabled:opacity-40"
	>
		{isSaving ? 'Saving…' : listing === null ? 'Create listing' : 'Save listing'}
	</button>
	{#if notice !== null}
		<p class={`text-xs ${notice.tone === 'go' ? 'text-go' : 'text-caution'}`}>{notice.message}</p>
	{/if}
</form>
