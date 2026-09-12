<script lang="ts">
	import ItemGroup from './ItemGroup.svelte';
	import { bodyField, titleField } from './editorFields';
	import type { KbBrainItem } from '$lib/data/knowledge/knowledgeTypes';

	let {
		items,
		heading = 'Chunks',
		emptyHint = 'No chunks yet — each one is embedded and found by meaning, not keywords.'
	}: { items: KbBrainItem[]; heading?: string; emptyHint?: string } = $props();

	const chunks = $derived(items.filter((item) => item.itemKind === 'chunk'));
</script>

<div class="mx-auto w-full max-w-2xl">
	<ItemGroup
		{heading}
		{emptyHint}
		itemKind="chunk"
		fields={[
			titleField('Label', 'Where this chunk came from'),
			bodyField('Content', 'The text to embed.')
		]}
		submitLabel="Add chunk"
		items={chunks}
	/>
</div>
