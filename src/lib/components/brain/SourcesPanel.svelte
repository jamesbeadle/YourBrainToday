<script lang="ts">
	import SourceNotePanel from './SourceNotePanel.svelte';
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
	<p class="text-sm text-chalk/60">
		Everything the brain has learned from — documents, notes and links you add here, and data
		sent in by an MCP server or through the API. Each piece is read once and remembered in the
		model.
	</p>
	<SourceUploadPanel {brainId} {onOutOfCredits} />
	<SourceNotePanel {brainId} {onOutOfCredits} />
	{#if sources.length > 0}
		<ul class="flex flex-col">
			{#each sources as source (source.id)}
				<SourceRow {source} {isOwner} {onOutOfCredits} />
			{/each}
		</ul>
	{/if}
</section>
