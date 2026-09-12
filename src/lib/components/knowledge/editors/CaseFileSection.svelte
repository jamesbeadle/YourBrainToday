<script lang="ts">
	import ItemRow from './ItemRow.svelte';
	import { dataFrom } from './editorFields';
	import { episodeDetail, type CaseGroup } from './caseGrouping';

	let { group }: { group: CaseGroup } = $props();

	const frameEntries = $derived(
		[
			['Problem', dataFrom(group.caseFile, 'problem')],
			['Approach', dataFrom(group.caseFile, 'approach')],
			['Outcome', dataFrom(group.caseFile, 'outcome')]
		].filter(([, value]) => value !== '')
	);

	const status = $derived(dataFrom(group.caseFile, 'status') === 'closed' ? 'closed' : 'open');
</script>

<section class="flex flex-col gap-2 rounded-xl border border-hairline bg-night/40 p-4">
	<div class="flex items-baseline justify-between gap-3">
		<h4 class="font-display text-sm font-medium">{group.caseFile.title}</h4>
		<span class="text-xs tracking-widest text-chalk/40 uppercase">{status}</span>
	</div>
	{#if frameEntries.length > 0}
		<dl class="flex flex-col gap-1 text-xs text-chalk/60">
			{#each frameEntries as [label, value] (label)}
				<div class="flex gap-2">
					<dt class="w-16 shrink-0 tracking-widest text-chalk/40 uppercase">{label}</dt>
					<dd class="min-w-0">{value}</dd>
				</div>
			{/each}
		</dl>
	{/if}
	{#if group.episodes.length === 0}
		<p class="text-sm text-chalk/40">No events on this case yet.</p>
	{:else}
		<ul class="flex flex-col divide-y divide-hairline border-l-2 border-hairline pl-4">
			{#each group.episodes as episode (episode.id)}
				<ItemRow item={episode} detail={episodeDetail(episode)} />
			{/each}
		</ul>
	{/if}
</section>
