<script lang="ts">
	import { buildRegionModel } from '../../brain/regions/buildRegionModel';
	import { momentOf } from '../editors/caseGrouping';
	import { itemHref } from '$lib/data/knowledge/knowledgeBaseRoutes';
	import type { KbBrainItem } from '$lib/data/knowledge/knowledgeTypes';

	let {
		knowledgeBaseId,
		brainId,
		items,
		seed,
		regionId
	}: {
		knowledgeBaseId: string;
		brainId: string;
		items: KbBrainItem[];
		seed: string;
		regionId: string;
	} = $props();

	/** A region's neurons are its episodes by item id; the items prop names them. */
	const region = $derived(
		buildRegionModel(items, seed).regions.find((candidate) => candidate.id === regionId) ?? null
	);
	const episodes = $derived(
		(region?.neurons ?? [])
			.filter((neuron) => neuron.isEpisode)
			.flatMap((neuron) => items.find((item) => item.id === neuron.id) ?? [])
			.toSorted((first, second) => momentOf(second).localeCompare(momentOf(first)))
	);
	const caseFile = $derived(items.find((item) => item.id === regionId) ?? null);

	function dayOf(episode: KbBrainItem): string {
		return new Date(momentOf(episode)).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
	}
</script>

{#if region !== null}
	<aside
		aria-label={`Episodes in ${region.name}`}
		class="absolute top-16 left-4 z-10 flex max-h-[60%] w-72 flex-col gap-2 overflow-y-auto
			rounded-2xl border border-hairline bg-night/80 p-4 backdrop-blur"
	>
		<p class="font-mono text-[10px] tracking-widest text-chalk/40 uppercase">{region.caption}</p>
		{#if caseFile !== null}
			<a
				href={itemHref(knowledgeBaseId, brainId, caseFile.id)}
				class="font-display text-sm text-chalk/80 underline decoration-hairline transition hover:text-chalk"
			>
				Open the case file →
			</a>
		{/if}
		{#if episodes.length === 0}
			<p class="text-sm text-chalk/50">No episodes here yet.</p>
		{:else}
			<ul class="flex flex-col divide-y divide-hairline">
				{#each episodes as episode (episode.id)}
					<li>
						<a
							href={itemHref(knowledgeBaseId, brainId, episode.id)}
							class="flex items-baseline gap-3 py-2 text-sm text-chalk/80 transition hover:text-chalk"
						>
							<span class="shrink-0 font-display text-xs text-chalk/40">{dayOf(episode)}</span>
							<span class="min-w-0 truncate">{episode.title}</span>
						</a>
					</li>
				{/each}
			</ul>
		{/if}
	</aside>
{/if}
