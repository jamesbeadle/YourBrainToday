<script lang="ts">
	import ItemComposer from './ItemComposer.svelte';
	import ItemGroup from './ItemGroup.svelte';
	import ItemRow from './ItemRow.svelte';
	import { dataField, titleField, type FieldOption } from './editorFields';
	import { flattenItemTree } from './flattenItemTree';
	import type { KbBrainItem } from '$lib/data/knowledge/knowledgeTypes';

	let { items }: { items: KbBrainItem[] } = $props();

	const terms = $derived(items.filter((item) => item.itemKind === 'term'));
	const relationNames = $derived(items.filter((item) => item.itemKind === 'relation_name'));
	const treeEntries = $derived(flattenItemTree(terms));

	const parentOptions = $derived<FieldOption[]>([
		{ value: '', label: '(top level)' },
		...terms.map((term) => ({ value: term.id, label: term.title }))
	]);
</script>

<div class="grid gap-6 lg:grid-cols-2">
	<section class="flex flex-col gap-3">
		<h3 class="font-display text-sm tracking-widest text-chalk/50 uppercase">
			Classification tree
		</h3>
		{#if terms.length === 0}
			<p class="text-sm text-chalk/40">No terms yet — start the hierarchy from its roots.</p>
		{:else}
			<div class="flex flex-col divide-y divide-hairline">
				{#each treeEntries as entry (entry.item.id)}
					<ul style={`margin-left: ${entry.depth * 1.5}rem`}>
						<ItemRow item={entry.item} shouldShowBody={false} />
					</ul>
				{/each}
			</div>
		{/if}
		<ItemComposer
			itemKind="term"
			fields={[
				titleField('Term', 'Equipment, Contracts, Safety…'),
				{ name: 'parentItemId', label: 'Parent term', control: 'select', options: parentOptions }
			]}
			submitLabel="Add term"
		/>
	</section>
	<ItemGroup
		heading="Relation vocabulary"
		emptyHint="No relation names yet — the controlled vocabulary for linking terms."
		itemKind="relation_name"
		fields={[
			titleField('Relation name', 'is part of, supersedes, requires…'),
			dataField('inverse', 'Inverse name', 'contains, superseded by…')
		]}
		submitLabel="Add relation name"
		items={relationNames}
	/>
</div>
