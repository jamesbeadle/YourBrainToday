<script lang="ts">
	import ItemComposer from './ItemComposer.svelte';
	import ItemRow from './ItemRow.svelte';
	import { flattenItemTree } from './flattenItemTree';
	import type { FieldOption } from './editorFields';
	import type { KbBrainItem } from '$lib/data/knowledge/knowledgeTypes';

	let { items }: { items: KbBrainItem[] } = $props();

	const blocks = $derived(items.filter((item) => item.itemKind === 'block'));
	const treeEntries = $derived(flattenItemTree(blocks));

	const parentOptions = $derived<FieldOption[]>([
		{ value: '', label: '(top level)' },
		...blocks.map((block) => ({ value: block.id, label: blockLabel(block) }))
	]);

	function blockLabel(block: KbBrainItem): string {
		return block.title.length > 60 ? `${block.title.slice(0, 60)}…` : block.title;
	}
</script>

<div class="mx-auto flex w-full max-w-2xl flex-col gap-6">
	<section class="flex flex-col gap-3">
		<h3 class="font-display text-sm tracking-widest text-chalk/50 uppercase">Blocks</h3>
		{#if blocks.length === 0}
			<p class="text-sm text-chalk/40">
				No blocks yet — everything is a block; nest them to grow documents from fragments.
			</p>
		{:else}
			<div class="flex flex-col divide-y divide-hairline">
				{#each treeEntries as entry (entry.item.id)}
					<ul
						class={entry.depth > 0 ? 'border-l border-hairline' : ''}
						style={`margin-left: ${entry.depth * 1.5}rem`}
					>
						<ItemRow item={entry.item} shouldShowBody={false} />
					</ul>
				{/each}
			</div>
		{/if}
	</section>
	<ItemComposer
		itemKind="block"
		fields={[
			{ name: 'title', label: 'Block', control: 'text', isRequired: true },
			{ name: 'parentItemId', label: 'Nest under', control: 'select', options: parentOptions }
		]}
		submitLabel="Add block"
	/>
</div>
