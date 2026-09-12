<script lang="ts">
	import SourceRow from './SourceRow.svelte';
	import SourceUploadPanel from './SourceUploadPanel.svelte';
	import type { BrainSource } from '$lib/data/brainTypes';

	let {
		brainId,
		isOwner,
		sources,
		onOutOfCredits
	}: {
		brainId: string;
		isOwner: boolean;
		sources: BrainSource[];
		onOutOfCredits: () => void;
	} = $props();
</script>

<section class="flex flex-col gap-4 p-4">
	<div>
		
		<p class="text-sm text-chalk/60">
			The raw material — every document is read once and remembered in the model.
		</p>
	</div>
	<SourceUploadPanel {brainId} {onOutOfCredits} />
	{#if sources.length > 0}
		<ul class="flex flex-col">
			{#each sources as source (source.id)}
				<SourceRow {source} {isOwner} {onOutOfCredits} />
			{/each}
		</ul>
	{/if}
</section>
