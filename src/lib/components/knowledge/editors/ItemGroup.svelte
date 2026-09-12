<script lang="ts">
	import ItemComposer from './ItemComposer.svelte';
	import ItemRow from './ItemRow.svelte';
	import type { FieldSpec } from './editorFields';
	import type { KbBrainItem } from '$lib/data/knowledge/knowledgeTypes';

	let {
		heading,
		emptyHint,
		itemKind,
		fields,
		submitLabel,
		items,
		detailFor = () => ''
	}: {
		heading: string;
		emptyHint: string;
		itemKind: string;
		fields: FieldSpec[];
		submitLabel: string;
		items: KbBrainItem[];
		detailFor?: (item: KbBrainItem) => string;
	} = $props();
</script>

<section class="flex flex-col gap-3">
	<h3 class="font-display text-sm tracking-widest text-chalk/50 uppercase">{heading}</h3>
	{#if items.length === 0}
		<p class="text-sm text-chalk/40">{emptyHint}</p>
	{:else}
		<ul class="flex flex-col divide-y divide-hairline">
			{#each items as item (item.id)}
				<ItemRow {item} detail={detailFor(item)} />
			{/each}
		</ul>
	{/if}
	<ItemComposer {itemKind} {fields} {submitLabel} />
</section>
