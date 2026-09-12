<script lang="ts">
	import { creditsPerBrainUnlearn } from '$lib/data/creditPricing';
	import { invalidateAll } from '$app/navigation';
	import { removeSource } from './removeSource';
	import type { BrainSource } from '$lib/data/brainTypes';

	let {
		source,
		onOutOfCredits,
		onFailure
	}: {
		source: BrainSource;
		onOutOfCredits: () => void;
		onFailure: (message: string) => void;
	} = $props();

	let isConfirming = $state(false);
	let isRemoving = $state(false);

	const needsUnlearning = $derived(source.status === 'ingested');

	async function requestRemoval() {
		if (needsUnlearning && !isConfirming) {
			isConfirming = true;
			return;
		}
		isConfirming = false;
		isRemoving = true;
		const outcome = await removeSource(source.id);
		isRemoving = false;
		if (outcome.status === 'out_of_credits') return onOutOfCredits();
		if (outcome.status === 'failed') onFailure(outcome.message);
		await invalidateAll();
	}
</script>

{#if isRemoving}
	<span class="animate-pulse font-display text-xs text-chalk/50">
		{needsUnlearning ? 'Unlearning…' : 'Removing…'}
	</span>
{:else if isConfirming}
	<span class="flex items-center gap-2 font-display text-xs">
		<span class="text-caution">Unlearn — {creditsPerBrainUnlearn} credits?</span>
		<button type="button" onclick={requestRemoval} class="text-signal underline transition hover:brightness-110">
			Yes
		</button>
		<button
			type="button"
			onclick={() => (isConfirming = false)}
			class="text-chalk/60 underline transition hover:text-chalk"
		>
			No
		</button>
	</span>
{:else}
	<button
		type="button"
		onclick={requestRemoval}
		aria-label={`Delete ${source.filename}`}
		title={needsUnlearning ? `Delete and unlearn — ${creditsPerBrainUnlearn} credits` : 'Delete'}
		class="rounded-full px-1.5 text-chalk/40 transition hover:bg-hairline/40 hover:text-signal"
	>
		✕
	</button>
{/if}
