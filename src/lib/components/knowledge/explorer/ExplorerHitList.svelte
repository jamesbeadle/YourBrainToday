<script lang="ts">
	import ExplorerHitRow from './ExplorerHitRow.svelte';
	import type { KnowledgeSearch } from './knowledgeSearch.svelte';

	let { search }: { search: KnowledgeSearch } = $props();
</script>

<div class="flex flex-col gap-2">
	<div class="flex flex-wrap items-baseline justify-between gap-2 px-3">
		<p class="font-display text-xs text-chalk/60">
			{search.hits?.length ?? 0} in the bodies for “{search.searchedText}”
		</p>
		<button
			type="button"
			onclick={() => search.forget()}
			class="font-display text-xs text-chalk/50 underline transition hover:text-chalk"
		>
			Back to the index
		</button>
	</div>
	{#if search.hits !== null && search.hits.length === 0}
		<p class="px-3 py-6 text-sm text-chalk/50">No body mentions those words.</p>
	{:else if search.hits !== null}
		<ul class="flex flex-col">
			{#each search.hits as hit (hit.id)}
				<ExplorerHitRow {hit} />
			{/each}
		</ul>
	{/if}
</div>
