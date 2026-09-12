<script lang="ts">
	import ItemGroup from './ItemGroup.svelte';
	import { bodyField, dataField, dataFrom, dataSelectField, titleField } from './editorFields';
	import type { KbBrainItem } from '$lib/data/knowledge/knowledgeTypes';

	let { items }: { items: KbBrainItem[] } = $props();

	const nodeTypes = $derived(items.filter((item) => item.itemKind === 'node_type'));
	const relationTypes = $derived(items.filter((item) => item.itemKind === 'relation_type'));
	const constraints = $derived(items.filter((item) => item.itemKind === 'constraint'));
	const nodeTypeNames = $derived(nodeTypes.map((nodeType) => nodeType.title));
</script>

<div class="grid gap-6 lg:grid-cols-2">
	<ItemGroup
		heading="Node types"
		emptyHint="No node types yet — define the kinds of things this domain contains."
		itemKind="node_type"
		fields={[
			titleField('Type name', 'Client, Project, Invoice…'),
			dataField('properties', 'Properties', 'name, email, start date (comma separated)'),
			bodyField('Notes', 'What is this type, exactly?')
		]}
		submitLabel="Add node type"
		items={nodeTypes}
		detailFor={(item) => dataFrom(item, 'properties')}
	/>
	<div class="flex flex-col gap-6">
		<ItemGroup
			heading="Relations"
			emptyHint="No relations yet — say how the types connect."
			itemKind="relation_type"
			fields={[
				titleField('Relation name', 'belongs to, employs, invoices…'),
				...(nodeTypeNames.length > 0
					? [
							dataSelectField('fromType', 'From type', nodeTypeNames),
							dataSelectField('toType', 'To type', nodeTypeNames)
						]
					: [dataField('fromType', 'From type'), dataField('toType', 'To type')])
			]}
			submitLabel="Add relation"
			items={relationTypes}
			detailFor={(item) => `${dataFrom(item, 'fromType')} → ${dataFrom(item, 'toType')}`}
		/>
		<ItemGroup
			heading="Constraints"
			emptyHint="No constraints yet — capture what must always hold."
			itemKind="constraint"
			fields={[
				titleField('Constraint', 'Every project has exactly one client'),
				bodyField('Detail')
			]}
			submitLabel="Add constraint"
			items={constraints}
		/>
	</div>
</div>
