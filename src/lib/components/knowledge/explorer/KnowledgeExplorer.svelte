<script lang="ts">
	import ExplorerChips from './ExplorerChips.svelte';
	import ExplorerHitList from './ExplorerHitList.svelte';
	import ExplorerResultList from './ExplorerResultList.svelte';
	import ExplorerSearchBox from './ExplorerSearchBox.svelte';
	import { brainChipsFrom, kindChipsFrom } from './explorerChips';
	import { filterKnowledgeIndex, toggled } from './filterKnowledgeIndex';
	import { KnowledgeSearch } from './knowledgeSearch.svelte';
	import { selectClasses } from '../../site/formStyles';
	import { isKnowledgeKind, type KnowledgeKind } from '$lib/data/knowledge/knowledgeKinds';
	import type { KnowledgeIndexEntry, KnowledgeIndexSort } from '$lib/data/knowledge/knowledgeIndex';

	let {
		knowledgeBaseId,
		entries
	}: { knowledgeBaseId: string; entries: KnowledgeIndexEntry[] } = $props();

	let text = $state('');
	let brainIds = $state<string[]>([]);
	let kinds = $state<KnowledgeKind[]>([]);
	let sort = $state<KnowledgeIndexSort>('name');

	const brainChips = $derived(brainChipsFrom(entries));
	const kindChips = $derived(kindChipsFrom(entries));
	const shownEntries = $derived(filterKnowledgeIndex(entries, { text, brainIds, kinds, sort }));

	const search = new KnowledgeSearch(() => knowledgeBaseId, brainNameFor);

	function brainNameFor(brainId: string): string {
		return entries.find((entry) => entry.brainId === brainId)?.brainName ?? '';
	}

	function toggleKind(key: string): void {
		if (isKnowledgeKind(key)) kinds = toggled(kinds, key);
	}

	$effect(() => {
		if (text.trim() === '') search.forget();
	});
</script>

<div class="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-5 lg:px-6">
	<ExplorerSearchBox bind:text isSearching={search.isSearching} onSearchBodies={() => search.ask(text)} />
	{#if search.failure !== null}
		<p class="text-sm text-signal">{search.failure}</p>
	{/if}
	{#if search.hasAnswer}
		<ExplorerHitList {search} />
	{:else}
		<ExplorerChips
			label="Brain"
			chips={brainChips}
			chosenKeys={brainIds}
			onToggle={(key) => (brainIds = toggled(brainIds, key))}
		/>
		<ExplorerChips label="Kind" chips={kindChips} chosenKeys={kinds} onToggle={toggleKind} />
		<div class="flex items-center justify-between gap-3 px-3">
			<p class="font-display text-xs text-chalk/60">
				{shownEntries.length} of {entries.length}
			</p>
			<label class="flex items-center gap-2 font-display text-xs text-chalk/60">
				Sort
				<select bind:value={sort} class={[selectClasses, 'py-1 text-xs']}>
					<option value="name">by name</option>
					<option value="newest">newest first</option>
				</select>
			</label>
		</div>
		<ExplorerResultList entries={shownEntries} />
	{/if}
</div>
