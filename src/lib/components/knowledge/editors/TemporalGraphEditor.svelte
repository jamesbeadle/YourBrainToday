<script lang="ts">
	import ItemGroup from './ItemGroup.svelte';
	import { dataFrom, dataSelectField, titleField, type FieldSpec } from './editorFields';
	import type { KbBrainItem } from '$lib/data/knowledge/knowledgeTypes';

	let { items }: { items: KbBrainItem[] } = $props();

	const graphEntities = $derived(items.filter((item) => item.itemKind === 'graph_entity'));
	const facts = $derived(items.filter((item) => item.itemKind === 'fact'));
	const entityNames = $derived(graphEntities.map((graphEntity) => graphEntity.title));

	const factFields = $derived<FieldSpec[]>([
		dataSelectField('subject', 'Subject', entityNames),
		{ name: 'title', label: 'Relation', control: 'text', isRequired: true },
		dataSelectField('object', 'Object', entityNames),
		{ name: 'validFrom', label: 'True from', control: 'date' },
		{ name: 'validTo', label: 'Until (leave open if still true)', control: 'date' }
	]);

	function factDetail(fact: KbBrainItem): string {
		const statement = `${dataFrom(fact, 'subject')} — ${fact.title} → ${dataFrom(fact, 'object')}`;
		return `${statement} · ${validityOf(fact)}`;
	}

	function validityOf(fact: KbBrainItem): string {
		const from = fact.validFrom?.slice(0, 10) ?? 'always';
		const to = fact.validTo?.slice(0, 10) ?? 'now';
		return `${from} → ${to}`;
	}
</script>

<div class="grid gap-6 lg:grid-cols-2">
	<ItemGroup
		heading="Entities"
		emptyHint="No entities yet — the people, places, and things facts are about."
		itemKind="graph_entity"
		fields={[titleField('Entity', 'Acme Ltd, The Fenwick job, Sarah…')]}
		submitLabel="Add entity"
		items={graphEntities}
	/>
	<section class="flex flex-col gap-3">
		{#if graphEntities.length < 2}
			<h3 class="font-display text-sm tracking-widest text-chalk/50 uppercase">Facts</h3>
			<p class="text-sm text-chalk/40">
				Add at least two entities, then record facts between them with validity windows.
			</p>
		{:else}
			<ItemGroup
				heading="Facts"
				emptyHint="No facts yet — each one knows when it became true and when it stopped."
				itemKind="fact"
				fields={factFields}
				submitLabel="Add fact"
				items={facts}
				detailFor={factDetail}
			/>
		{/if}
	</section>
</div>
