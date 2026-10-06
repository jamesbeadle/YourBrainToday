<script lang="ts">
	import IngestProgressLabel from './IngestProgressLabel.svelte';
	import { badNotice, goodNotice, type SourceNotice } from './sourceNotice';
	import { drivenSources } from './drivenSources.svelte';
	import { invalidateAll } from '$app/navigation';
	import { readSourceStages } from './readSourceStages';
	import { readingSuccessLine } from './readingProgressSummary';
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

	let isReading = $state(false);
	let stageLabel = $state('');

	const action = $derived(actionFor(source));

	function actionFor(candidate: BrainSource): string | null {
		if (candidate.status === 'uploaded') return 'Read it';
		if (candidate.status === 'failed') return 'Try again';
		const isAbandoned = candidate.status === 'reading' && !drivenSources.has(candidate.id);
		if (isAbandoned) return 'Resume';
		return null;
	}

	async function read() {
		isReading = true;
		onNotice(null);
		const outcome = await readSourceStages(source.id, (stage) => (stageLabel = stage));
		isReading = false;
		await invalidateAll();
		if (outcome.status === 'out_of_credits') return onOutOfCredits();
		if (outcome.status === 'failed') return onNotice(badNotice(outcome.message));
		if (outcome.status === 'proposed') return onNotice(goodNotice(sentForReviewMessage));
		onNotice(goodNotice(readingSuccessLine(outcome.progress)));
	}
</script>

{#if isReading}
	<span class="animate-pulse font-display text-xs text-chalk/50">
		<IngestProgressLabel stage={stageLabel} />
	</span>
{:else if action !== null}
	<button
		type="button"
		onclick={read}
		title="Read this document into the brain — credits scale with its size"
		class="font-display text-xs text-chalk/70 underline transition hover:text-chalk"
	>
		{action}
	</button>
{/if}
