<script lang="ts">
	import type { ConstellationHover } from './constellation/constellationTypes';
	import { domainBlockLabels } from '$lib/data/domainBlocks';
	import type { BrainContext, BrainPageSummary } from '$lib/data/brainTypes';

	let {
		hover,
		contexts,
		pageIndex
	}: {
		hover: ConstellationHover;
		contexts: BrainContext[];
		pageIndex: BrainPageSummary[];
	} = $props();

	const hoveredPage = $derived(pageIndex.find((page) => page.slug === hover.neuronSlug));
	const hoveredContext = $derived(contexts.find((context) => context.slug === hover.nucleusSlug));

	const title = $derived(hoveredPage?.title ?? hoveredContext?.name ?? '');
	const caption = $derived(captionFor());

	function captionFor(): string {
		if (hoveredPage !== undefined) return domainBlockLabels[hoveredPage.kind].singular;
		if (hoveredContext?.isCoreDomain) return 'Bounded context · Core domain';
		return 'Bounded context';
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
