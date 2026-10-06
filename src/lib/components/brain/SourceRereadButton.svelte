<script lang="ts">
	import IngestProgressLabel from './IngestProgressLabel.svelte';
	import { badNotice, goodNotice, type SourceNotice } from './sourceNotice';
	import { invalidateAll } from '$app/navigation';
	import { readingSuccessLine } from './readingProgressSummary';
	import { rereadSource } from './rereadSource';
	import { sentForReviewMessage } from './uploadResolution';
	import type { BrainSource } from '$lib/data/brainSourceTypes';

	let {
		source,
		onOutOfCredits,
		onNotice
	}: {
		source: BrainSource;
		onOutOfCredits: () => void;
		onNotice: (notice: SourceNotice | null) => void;
	} = $props();

	let isConfirming = $state(false);
	let isRereading = $state(false);
	let stageLabel = $state('');

	async function requestReread() {
		if (!isConfirming) {
			isConfirming = true;
			return;
		}
		isConfirming = false;
		isRereading = true;
		onNotice(null);
		const outcome = await rereadSource(source.id, (stage) => (stageLabel = stage));
		isRereading = false;
		await invalidateAll();
		if (outcome.status === 'out_of_credits') return onOutOfCredits();
		if (outcome.status === 'failed') return onNotice(badNotice(outcome.message));
		if (outcome.status === 'proposed') return onNotice(goodNotice(sentForReviewMessage));
		onNotice(goodNotice(readingSuccessLine(outcome.progress)));
	}
</script>

{#if isRereading}
	<span class="animate-pulse font-display text-xs text-chalk/50">
		<IngestProgressLabel stage={stageLabel} />
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
