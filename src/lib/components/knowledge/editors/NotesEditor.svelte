<script lang="ts">
	import ItemComposer from './ItemComposer.svelte';
	import ItemRow from './ItemRow.svelte';
	import { bodyField, dataField, dataFrom, titleField } from './editorFields';
	import type { KbBrainItem } from '$lib/data/knowledge/knowledgeTypes';

	let {
		items,
		itemKind = 'note',
		heading = 'Notes',
		emptyHint = 'No notes yet — capture one idea per note and link as you go.',
		bodyPlaceholder = 'One idea, in your own words. Link with [[another note title]].'
	}: {
		items: KbBrainItem[];
		itemKind?: string;
		heading?: string;
		emptyHint?: string;
		bodyPlaceholder?: string;
	} = $props();

	const notes = $derived(items.filter((item) => item.itemKind === itemKind));
</script>

<div class="grid gap-6 lg:grid-cols-[2fr_1fr]">
	<section class="flex flex-col gap-3">
		<h3 class="font-display text-sm tracking-widest text-chalk/50 uppercase">{heading}</h3>
		{#if notes.length === 0}
			<p class="text-sm text-chalk/40">{emptyHint}</p>
		{:else}
			<ul class="flex flex-col divide-y divide-hairline">
				{#each notes as note (note.id)}
					<ItemRow item={note} detail={dataFrom(note, 'tags')} />
				{/each}
			</ul>
		{/if}
	</section>
	<div class="flex flex-col gap-2">
		<h3 class="font-display text-sm tracking-widest text-chalk/50 uppercase">Capture</h3>
		<ItemComposer
			{itemKind}
			fields={[
				titleField('Title'),
				bodyField('Body', bodyPlaceholder),
				dataField('tags', 'Tags', 'pricing, suppliers, safety…')
			]}
			submitLabel="Add"
		/>
	</div>
</div>
