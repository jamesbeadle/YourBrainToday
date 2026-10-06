<script lang="ts">
	import type { ConstellationHover } from './constellation/constellationTypes';
	import type { ConstellationVocabulary } from './constellation/constellationVocabulary';
	import type { BrainContext, BrainPageSummary } from '$lib/data/brainModelTypes';

	let {
		hover,
		contexts,
		pageIndex,
		vocabulary
	}: {
		hover: ConstellationHover;
		contexts: BrainContext[];
		pageIndex: BrainPageSummary[];
		vocabulary: ConstellationVocabulary;
	} = $props();

	const hoveredPage = $derived(pageIndex.find((page) => page.slug === hover.neuronSlug));
	const hoveredContext = $derived(contexts.find((context) => context.slug === hover.nucleusSlug));

	const title = $derived(hoveredPage?.title ?? hoveredContext?.name ?? '');
	const caption = $derived(captionFor());

	function captionFor(): string {
		if (hoveredPage !== undefined) return vocabulary.describeNeuron(hoveredPage);
		if (hoveredContext !== undefined) return vocabulary.describeNucleus(hoveredContext);
		return '';
	}
</script>

<div
	class="pointer-events-none absolute z-10 max-w-56 -translate-y-full rounded-lg border
		border-hairline bg-night/85 px-3 py-2 backdrop-blur"
	style={`left: ${hover.x + 14}px; top: ${hover.y - 10}px`}
>
	<p class="font-display text-sm text-chalk">{title}</p>
	<p class="text-xs text-chalk/50">{caption}</p>
</div>
