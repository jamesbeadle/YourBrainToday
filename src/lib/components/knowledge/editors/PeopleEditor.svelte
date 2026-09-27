<script lang="ts">
	import ItemGroup from './ItemGroup.svelte';
	import {
		bodyField,
		dataField,
		dataFrom,
		dataSelectField,
		titleField,
		type FieldSpec
	} from './editorFields';
	import { findWarmth, humanItemKinds, warmthScale } from '$lib/data/knowledge/humanConnections';
	import { roleLine } from '../../brain/people/peopleNetwork';
	import type { KbBrainItem } from '$lib/data/knowledge/knowledgeTypes';

	let { items }: { items: KbBrainItem[] } = $props();

	const people = $derived(items.filter((item) => item.itemKind === humanItemKinds.person));
	const connections = $derived(items.filter((item) => item.itemKind === humanItemKinds.connection));
	const personNames = $derived(people.map((person) => person.title));

	const personFields: FieldSpec[] = [
		titleField('Name', 'Sarah Hartley'),
		dataField('role', 'Role', 'Client’s project manager'),
		dataField('organisation', 'Organisation', 'Hartley Homes'),
		bodyField('Worth knowing', 'Prefers a call to an email; decides fast.')
	];

	const warmthField: FieldSpec = {
		name: 'data.warmth',
		label: 'How well do they get on?',
		control: 'select',
		options: warmthScale.map((definition) => ({
			value: definition.warmth,
			label: `${definition.label} — ${definition.meaning}`
		}))
	};

	const connectionFields = $derived<FieldSpec[]>([
		dataSelectField('from', 'Person', personNames),
		{ name: 'title', label: 'Relationship', control: 'text', isRequired: true },
		dataSelectField('to', 'Other person', personNames),
		warmthField,
		bodyField('Evidence', 'They fell out over the Fenwick job.')
	]);

	function connectionDetail(connection: KbBrainItem): string {
		const warmth = findWarmth(dataFrom(connection, 'warmth'));
		return `${dataFrom(connection, 'from')} ↔ ${dataFrom(connection, 'to')} · ${warmth.label}`;
	}
</script>

<div class="grid gap-6 lg:grid-cols-2">
	<ItemGroup
		heading="People"
		emptyHint="Nobody yet — the clients, suppliers, staff and gatekeepers around the business."
		itemKind={humanItemKinds.person}
		fields={personFields}
		submitLabel="Add person"
		items={people}
		detailFor={roleLine}
	/>
	<section class="flex flex-col gap-3">
		{#if people.length < 2}
			<h3 class="font-mono text-sm tracking-widest text-chalk/50 uppercase">Relationships</h3>
			<p class="text-sm text-chalk/40">
				Add at least two people, then record how they are connected and how well they get on.
			</p>
		{:else}
			<ItemGroup
				heading="Relationships"
				emptyHint="No relationships yet — who knows whom, and how warmly."
				itemKind={humanItemKinds.connection}
				fields={connectionFields}
				submitLabel="Add relationship"
				items={connections}
				detailFor={connectionDetail}
			/>
		{/if}
	</section>
</div>
