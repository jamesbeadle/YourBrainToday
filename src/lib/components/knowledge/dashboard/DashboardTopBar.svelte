<script lang="ts">
	import BrainBreadcrumb from './BrainBreadcrumb.svelte';
	import DashboardToolbar from './DashboardToolbar.svelte';
	import { topRowHeightPixels } from './dashboardLayout';
	import { useDashboardTools } from './dashboardTools.svelte';
	import { newBrainHref } from '$lib/data/knowledge/knowledgeBaseRoutes';
	import type { ConstellationSlot } from '../constellationSlots';
	import type { KnowledgeBase } from '$lib/server/knowledge/getKnowledgeBase';

	let {
		knowledgeBase,
		openSlot,
		openingSlot
	}: {
		knowledgeBase: KnowledgeBase;
		openSlot: ConstellationSlot | null;
		openingSlot: ConstellationSlot | null;
	} = $props();

	const toolbarTools = useDashboardTools().right;
	const shownSlot = $derived(openingSlot ?? openSlot);
</script>

<div
	class="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-center justify-between gap-3
		px-3"
	style:height={`${topRowHeightPixels}px`}
>
	{#if shownSlot === null}
		<a
			href={newBrainHref(knowledgeBase.id)}
			aria-label="Add a second brain"
			title="Add a second brain"
			class="pointer-events-auto min-w-0 shrink rounded-full border border-hairline bg-night/80 px-3
				py-1.5 font-display text-xs whitespace-nowrap text-chalk/60 transition hover:border-signal
				hover:text-signal sm:px-4"
		>
			+<span class="hidden sm:inline"> Add a second brain</span>
		</a>
	{:else}
		<BrainBreadcrumb {knowledgeBase} slot={shownSlot} isOpening={openingSlot !== null} />
		{#if toolbarTools.tools.length > 0}
			<DashboardToolbar
				tools={toolbarTools.tools}
				activeKey={toolbarTools.activeKey}
				onSelect={(key) => toolbarTools.toggle(key)}
			/>
		{/if}
	{/if}
</div>
