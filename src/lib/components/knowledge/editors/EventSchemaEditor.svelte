<script lang="ts">
	import ItemGroup from './ItemGroup.svelte';
	import { bodyField, dataField, dataFrom, titleField } from './editorFields';
	import type { KbBrainItem } from '$lib/data/knowledge/knowledgeTypes';

	let { items }: { items: KbBrainItem[] } = $props();

	const eventTypes = $derived(items.filter((item) => item.itemKind === 'event_type'));
	const transitions = $derived(items.filter((item) => item.itemKind === 'state_transition'));
</script>

<div class="grid gap-6 lg:grid-cols-2">
	<ItemGroup
		heading="Event types"
		emptyHint="No event types yet — the kinds of occurrences instances will record."
		itemKind="event_type"
		fields={[
			titleField('Event type', 'Contract signed, Payment overdue…'),
			dataField('validity', 'Temporal validity', 'Holds until superseded, expires after 30 days…'),
			bodyField('Detail', 'What does this event mean, and what does it carry?')
		]}
		submitLabel="Add event type"
		items={eventTypes}
		detailFor={(item) => dataFrom(item, 'validity')}
	/>
	<ItemGroup
		heading="State transitions"
		emptyHint="No transitions yet — which states can follow which."
		itemKind="state_transition"
		fields={[
			titleField('Transition', 'Quote accepted'),
			dataField('fromState', 'From state', 'Quoted'),
			dataField('toState', 'To state', 'Contracted')
		]}
		submitLabel="Add transition"
		items={transitions}
		detailFor={(item) => `${dataFrom(item, 'fromState')} → ${dataFrom(item, 'toState')}`}
	/>
</div>
