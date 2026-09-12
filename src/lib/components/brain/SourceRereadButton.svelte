<script lang="ts">
	import IngestProgressLabel from './IngestProgressLabel.svelte';
	import { invalidateAll } from '$app/navigation';
	import { rereadSource } from './rereadSource';
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
	let isRereading = $state(false);

	async function requestReread() {
		if (!isConfirming) {
			isConfirming = true;
			return;
		}
		isConfirming = false;
		isRereading = true;
		const outcome = await rereadSource(source.id);
		isRereading = false;
		if (outcome.status === 'out_of_credits') return onOutOfCredits();
		if (outcome.status === 'failed') onFailure(outcome.message);
		await invalidateAll();
	}
</script>

{#if isRereading}
	<span class="animate-pulse font-display text-xs text-chalk/50">
		<IngestProgressLabel />
	</span>
{:else if isConfirming}
	<span class="flex items-center gap-2 font-display text-xs">
		<span class="text-caution">Re-read — credits scale with its size?</span>
		<button
			type="button"
			onclick={requestReread}
			class="text-signal underline transition hover:brightness-110"
		>
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
		onclick={requestReread}
		title="Read this document again with the current modeller — credits scale with its size"
		class="font-display text-xs text-chalk/70 underline transition hover:text-chalk"
	>
		Re-read
	</button>
{/if}
