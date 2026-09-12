<script lang="ts">
	import ItemComposer from './ItemComposer.svelte';
	import ItemRow from './ItemRow.svelte';
	import { dataField, dataFrom, titleField, type FieldSpec } from './editorFields';
	import type { BoundSchemaType } from '$lib/data/knowledge/boundSchemaTypes';
	import type { KbBrainItem } from '$lib/data/knowledge/knowledgeTypes';

	let {
		items,
		schemaTypes
	}: { items: KbBrainItem[]; schemaTypes: BoundSchemaType[] } = $props();

	const records = $derived(items.filter((item) => item.itemKind === 'record'));

	let selectedTypeName = $state('');

	const selectedType = $derived(
		schemaTypes.find((schemaType) => schemaType.typeName === selectedTypeName) ?? null
	);
	const recordFields = $derived<FieldSpec[]>(
		selectedType === null
			? []
			: [
					titleField('Name', `This ${selectedType.typeName}'s name`),
					...selectedType.properties.map((property) => dataField(property, property))
				]
	);

	function recordDetail(record: KbBrainItem): string {
		const typeName = dataFrom(record, 'typeName');
		const values = Object.entries(record.data)
			.filter(([key, value]) => key !== 'typeName' && value !== '')
			.map(([key, value]) => `${key}: ${String(value)}`);
		return [typeName, ...values].join(' · ');
	}
</script>

<div class="grid gap-6 lg:grid-cols-[2fr_1fr]">
	<section class="flex flex-col gap-3">
		<h3 class="font-display text-sm tracking-widest text-chalk/50 uppercase">Records</h3>
		{#if records.length === 0}
			<p class="text-sm text-chalk/40">
				No records yet — each one conforms to a type your bound expertise brains define.
			</p>
		{:else}
			<ul class="flex flex-col divide-y divide-hairline">
				{#each records as record (record.id)}
					<ItemRow item={record} detail={recordDetail(record)} shouldShowBody={false} />
				{/each}
			</ul>
		{/if}
	</section>
	<div class="flex flex-col gap-2">
		<h3 class="font-display text-sm tracking-widest text-chalk/50 uppercase">New record</h3>
		{#if schemaTypes.length === 0}
			<p class="text-sm text-caution">
				Bind this brain to an expertise brain with node types, and its types become forms here.
			</p>
		{:else}
			<label class="flex flex-col gap-1">
				<span class="text-xs tracking-widest text-chalk/50 uppercase">Type</span>
				<select
					bind:value={selectedTypeName}
					class="rounded-xl border border-hairline bg-night px-3 py-2 text-sm text-chalk"
				>
					<option value="">Choose a type…</option>
					{#each schemaTypes as schemaType (schemaType.typeName)}
						<option value={schemaType.typeName}>{schemaType.typeName}</option>
					{/each}
				</select>
			</label>
			{#if selectedType !== null}
				<ItemComposer
					itemKind="record"
					fields={recordFields}
					submitLabel="Add record"
					hiddenValues={{ 'data.typeName': selectedType.typeName }}
				/>
			{/if}
		{/if}
	</div>
</div>
