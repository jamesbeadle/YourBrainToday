<script lang="ts">
	import CaseFileSection from './CaseFileSection.svelte';
	import ItemComposer from './ItemComposer.svelte';
	import ItemRow from './ItemRow.svelte';
	import { bodyField, dataField, titleField, type FieldOption } from './editorFields';
	import { episodeDetail, groupByCases } from './caseGrouping';
	import type { KbBrainItem } from '$lib/data/knowledge/knowledgeTypes';

	let { items }: { items: KbBrainItem[] } = $props();

	const grouped = $derived(groupByCases(items));

	const caseOptions = $derived<FieldOption[]>([
		{ value: '', label: '(no case)' },
		...grouped.caseGroups.map((group) => ({
			value: group.caseFile.id,
			label: group.caseFile.title
		}))
	]);
</script>

<div class="grid gap-6 lg:grid-cols-[2fr_1fr]">
	<section class="flex flex-col gap-3">
		<h3 class="font-display text-sm tracking-widest text-chalk/50 uppercase">Case files</h3>
		{#if grouped.caseGroups.length === 0}
			<p class="text-sm text-chalk/40">
				No case files yet — name the job or client when recording an event and its case opens
				itself.
			</p>
		{:else}
			{#each grouped.caseGroups as group (group.caseFile.id)}
				<CaseFileSection {group} />
			{/each}
		{/if}
		<h3 class="font-display text-sm tracking-widest text-chalk/50 uppercase">Timeline</h3>
		{#if grouped.caselessEpisodes.length === 0}
			<p class="text-sm text-chalk/40">
				Nothing outside a case yet — uncased events land here in order and are never rewritten.
			</p>
		{:else}
			<ul class="flex flex-col divide-y divide-hairline border-l-2 border-hairline pl-4">
				{#each grouped.caselessEpisodes as episode (episode.id)}
					<ItemRow item={episode} detail={episodeDetail(episode)} />
				{/each}
			</ul>
		{/if}
	</section>
	<div class="flex flex-col gap-4">
		<div class="flex flex-col gap-2">
			<h3 class="font-display text-sm tracking-widest text-chalk/50 uppercase">Record an event</h3>
			<ItemComposer
				itemKind="episode"
				fields={[
					titleField('What happened', 'Past tense — "Survey signed off"…'),
					bodyField('Detail'),
					{ name: 'parentItemId', label: 'Case', control: 'select', options: caseOptions },
					{ name: 'occurredAt', label: 'When', control: 'datetime' },
					dataField('provenance', 'Provenance', 'Who or what reported this?')
				]}
				submitLabel="Record it"
			/>
		</div>
		<div class="flex flex-col gap-2">
			<h3 class="font-display text-sm tracking-widest text-chalk/50 uppercase">Open a case file</h3>
			<ItemComposer
				itemKind="case"
				fields={[
					titleField('Case', 'A job, a client, a season…'),
					dataField('problem', 'Problem', 'What is this case setting out to do?')
				]}
				submitLabel="Open case"
			/>
		</div>
	</div>
</div>
