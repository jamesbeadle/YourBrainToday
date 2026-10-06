<script lang="ts">
	import ConstellationHud from './ConstellationHud.svelte';
	import NeuronDetailPanel from './NeuronDetailPanel.svelte';
	import NeuronTooltip from './NeuronTooltip.svelte';
	import type { ConstellationExploration } from './constellation/constellationExploration.svelte';
	import type { BrainPagePayload } from './constellation/fetchBrainPage';
	import type { ConstellationVocabulary } from './constellation/constellationVocabulary';
	import type { BrainContext, BrainPageSummary } from '$lib/data/brainModelTypes';

	let {
		exploration,
		loadPage,
		pageBasePath,
		contexts,
		pageIndex,
		vocabulary
	}: {
		exploration: ConstellationExploration;
		loadPage: (slug: string) => Promise<BrainPagePayload>;
		pageBasePath: string | null;
		contexts: BrainContext[];
		pageIndex: BrainPageSummary[];
		vocabulary: ConstellationVocabulary;
	} = $props();
</script>

<ConstellationHud
	{contexts}
	{pageIndex}
	focusedContextSlug={exploration.focusedContextSlug}
	selectedSlug={exploration.selectedSlug}
	hasKindKey={vocabulary.hasKindKey}
	onReturnToModel={exploration.returnToModel}
	onReturnToContext={exploration.returnToContext}
/>
{#if exploration.hover !== null && exploration.selectedSlug === null}
	<NeuronTooltip hover={exploration.hover} {contexts} {pageIndex} {vocabulary} />
{/if}
{#if exploration.selectedSlug !== null}
	<NeuronDetailPanel
		{loadPage}
		{pageBasePath}
		{vocabulary}
		slug={exploration.selectedSlug}
		onClose={exploration.returnToContext}
	/>
{/if}
