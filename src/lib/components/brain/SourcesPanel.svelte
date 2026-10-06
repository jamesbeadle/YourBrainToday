<script lang="ts">
	import SourceCapturePanel from './SourceCapturePanel.svelte';
	import SourceRow from './SourceRow.svelte';
	import SourceUploadPanel from './SourceUploadPanel.svelte';
	import SourceUploadQueueList from './SourceUploadQueueList.svelte';
	import { SourceUploadQueue } from './sourceUploadQueue.svelte';
	import { invalidateAll } from '$app/navigation';
	import type { BrainSource } from '$lib/data/brainSourceTypes';

	let {
		brainId,
		isOwner,
		sources,
		pageBasePath,
		onOutOfCredits
	}: {
		brainId: string;
		isOwner: boolean;
		sources: BrainSource[];
		pageBasePath: string;
		onOutOfCredits: () => void;
	} = $props();

	const queue = new SourceUploadQueue({
		onOutOfCredits: () => onOutOfCredits(),
		onSettled: invalidateAll
	});

	function warnWhileBusy(event: BeforeUnloadEvent) {
		if (!queue.isBusy) return;
		event.preventDefault();
	}
</script>

<svelte:window onbeforeunload={warnWhileBusy} />

<section class="flex flex-col gap-4 p-4">
	<p class="text-sm text-chalk/60">
		Everything the brain has learned from — documents you file and anything you capture here,
		and data sent in by an MCP server or through the API. Each piece is read once and remembered in the model.
	</p>
	<SourceCapturePanel {brainId} {queue} />
	<SourceUploadPanel {brainId} {queue} />
	<SourceUploadQueueList {queue} />
	{#if sources.length > 0}
		<ul class="flex flex-col">
			{#each sources as source (source.id)}
				<SourceRow {source} {isOwner} {pageBasePath} {onOutOfCredits} />
			{/each}
		</ul>
	{/if}
</section>
