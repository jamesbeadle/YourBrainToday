<script lang="ts">
	import ItemGroup from './ItemGroup.svelte';
	import {
		bodyField,
		dataField,
		dataFrom,
		dataSelectField,
		titleField
	} from './editorFields';
	import type { KbBrainItem } from '$lib/data/knowledge/knowledgeTypes';

	let { items }: { items: KbBrainItem[] } = $props();

	const nodeTypes = $derived(items.filter((item) => item.itemKind === 'node_type'));
	const relationTypes = $derived(items.filter((item) => item.itemKind === 'relation_type'));
	const rules = $derived(items.filter((item) => item.itemKind === 'rule'));
	const nodeTypeNames = $derived(nodeTypes.map((nodeType) => nodeType.title));
</script>

<div class="grid gap-6 lg:grid-cols-3">
	<ItemGroup
		heading="Core types"
		emptyHint="A handful of types is enough to start."
		itemKind="node_type"
		fields={[
			titleField('Type name', 'Client, Job, Machine…'),
			dataField('properties', 'Properties', 'comma separated')
		]}
		submitLabel="Add type"
		items={nodeTypes}
		detailFor={(item) => dataFrom(item, 'properties')}
	/>
	<ItemGroup
		heading="Key relations"
		emptyHint="Just the connections that matter."
		itemKind="relation_type"
		fields={[
			titleField('Relation', 'owns, operates, maintains…'),
			...(nodeTypeNames.length > 0
				? [
						dataSelectField('fromType', 'From', nodeTypeNames),
						dataSelectField('toType', 'To', nodeTypeNames)
					]
				: [dataField('fromType', 'From'), dataField('toType', 'To')])
		]}
		submitLabel="Add relation"
		items={relationTypes}
		detailFor={(item) => `${dataFrom(item, 'fromType')} → ${dataFrom(item, 'toType')}`}
	/>
	<ItemGroup
		heading="A few rules"
		emptyHint="Only the rules you actually rely on."
		itemKind="rule"
		fields={[titleField('Rule'), bodyField('Detail')]}
		submitLabel="Add rule"
		items={rules}
	/>
</div>
