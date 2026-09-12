<script lang="ts">
	import ChunkStoreEditor from './ChunkStoreEditor.svelte';
	import ItemGroup from './ItemGroup.svelte';
	import { dataField, dataFrom, titleField } from './editorFields';
	import type { KbBrainItem } from '$lib/data/knowledge/knowledgeTypes';

	let { items }: { items: KbBrainItem[] } = $props();

	const extractedEntities = $derived(items.filter((item) => item.itemKind === 'extracted_entity'));
</script>

<div class="grid gap-6 lg:grid-cols-2">
	<ChunkStoreEditor
		{items}
		heading="Chunks"
		emptyHint="No chunks yet — the semantic half: text embedded for similarity search."
	/>
	<ItemGroup
		heading="Extracted entities"
		emptyHint="No entities yet — the graph half: what the chunks mention, linked together."
		itemKind="extracted_entity"
		fields={[
			titleField('Entity', 'Acme Ltd, scaffolding licence, VAT…'),
			dataField('relations', 'Relations', 'supplies Acme, requires permit… (comma separated)')
		]}
		submitLabel="Add entity"
		items={extractedEntities}
		detailFor={(item) => dataFrom(item, 'relations')}
	/>
</div>
