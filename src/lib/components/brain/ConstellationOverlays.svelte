<script lang="ts">
	import ConstellationHud from './ConstellationHud.svelte';
	import NeuronDetailPanel from './NeuronDetailPanel.svelte';
	import NeuronTooltip from './NeuronTooltip.svelte';
	import type { ConstellationExploration } from './constellation/constellationExploration.svelte';
	import type { BrainPagePayload } from './constellation/fetchBrainPage';
	import type { BrainContext, BrainPageSummary } from '$lib/data/brainTypes';

	let {
		exploration,
		loadPage,
		pageBasePath,
		contexts,
		pageIndex
	}: {
		exploration: ConstellationExploration;
		loadPage: (slug: string) => Promise<BrainPagePayload>;
		pageBasePath: string | null;
		contexts: BrainContext[];
		pageIndex: BrainPageSummary[];
	} = $props();
</script>

<ConstellationHud
	{contexts}
	{pageIndex}
	focusedContextSlug={exploration.focusedContextSlug}
	selectedSlug={exploration.selectedSlug}
	onReturnToModel={exploration.returnToModel}
	onReturnToContext={exploration.returnToContext}
/>
{#if exploration.hover !== null && exploration.selectedSlug === null}
	<NeuronTooltip hover={exploration.hover} {contexts} {pageIndex} />
{/if}
{#if exploration.selectedSlug !== null}
	<NeuronDetailPanel
		{loadPage}
		{pageBasePath}
		slug={exploration.selectedSlug}
		onClose={exploration.returnToContext}
	/>
{/if}
