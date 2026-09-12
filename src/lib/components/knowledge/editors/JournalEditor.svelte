<script lang="ts">
	import ItemComposer from './ItemComposer.svelte';
	import ItemRow from './ItemRow.svelte';
	import { bodyField } from './editorFields';
	import type { KbBrainItem } from '$lib/data/knowledge/knowledgeTypes';

	let { items }: { items: KbBrainItem[] } = $props();

	const entries = $derived(
		items
			.filter((item) => item.itemKind === 'journal_entry')
			.toSorted((first, second) => dayOf(second).localeCompare(dayOf(first)))
	);
	const entryDays = $derived([...new Set(entries.map(dayOf))]);

	function dayOf(entry: KbBrainItem): string {
		return (entry.occurredAt ?? entry.createdAt).slice(0, 10);
	}

	function entriesOn(day: string): KbBrainItem[] {
		return entries.filter((entry) => dayOf(entry) === day);
	}

	function readableDay(day: string): string {
		return new Date(`${day}T00:00:00`).toLocaleDateString(undefined, {
			weekday: 'long',
			day: 'numeric',
			month: 'long'
		});
	}
</script>

<div class="mx-auto flex w-full max-w-2xl flex-col gap-6">
	<ItemComposer
		itemKind="journal_entry"
		fields={[
			{ name: 'title', label: 'Today', control: 'text', placeholder: 'A few words of headline' },
			bodyField('Entry', 'Get it down now, find it by date later.'),
			{ name: 'occurredAt', label: 'Date', control: 'date' }
		]}
		submitLabel="Add entry"
	/>
	{#if entries.length === 0}
		<p class="text-center text-sm text-chalk/40">
			Nothing captured yet — the journal starts with today.
		</p>
	{/if}
	{#each entryDays as day (day)}
		<section class="flex flex-col gap-2">
			<h3 class="font-display text-sm tracking-widest text-chalk/50 uppercase">
				{readableDay(day)}
			</h3>
			<ul class="flex flex-col divide-y divide-hairline">
				{#each entriesOn(day) as entry (entry.id)}
					<ItemRow item={entry} />
				{/each}
			</ul>
		</section>
	{/each}
</div>
