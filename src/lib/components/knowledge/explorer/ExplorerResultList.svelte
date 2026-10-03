<script lang="ts">
	import ExplorerEntryRow from './ExplorerEntryRow.svelte';
	import { quietButtonClasses } from '../../site/formStyles';
	import type { KnowledgeIndexEntry } from '$lib/data/knowledge/knowledgeIndex';

	let { entries }: { entries: KnowledgeIndexEntry[] } = $props();

	const pageSize = 300;

	let shownCount = $state(pageSize);

	$effect(() => {
		void entries;
		shownCount = pageSize;
	});

	const shownEntries = $derived(entries.slice(0, shownCount));
	const hiddenCount = $derived(Math.max(0, entries.length - shownCount));
</script>

{#if entries.length === 0}
	<p class="px-3 py-6 text-sm text-chalk/50">Nothing matches — try fewer words or another chip.</p>
{:else}
	<ul class="flex flex-col">
		{#each shownEntries as entry (entry.id)}
			<ExplorerEntryRow {entry} />
		{/each}
	</ul>
	{#if hiddenCount > 0}
		<div class="flex justify-center py-4">
			<button type="button" onclick={() => (shownCount += pageSize)} class={quietButtonClasses}>
				Show {Math.min(pageSize, hiddenCount)} more of {hiddenCount}
			</button>
		</div>
	{/if}
{/if}
