<script lang="ts">
	import DashboardPanel from './DashboardPanel.svelte';
	import DashboardScene from './DashboardScene.svelte';
	import KnowledgeBaseRail from './KnowledgeBaseRail.svelte';
	import KnowledgeBaseToolset from './KnowledgeBaseToolset.svelte';
	import { provideDashboardTools } from './dashboardTools.svelte';
	import { openingKnowledgeBaseTool } from './knowledgeBaseTools';
	import { buildConstellationSlots } from '../constellationSlots';
	import { screen } from '$lib/client/screen.svelte';
	import { page } from '$app/state';
	import { onMount, type Snippet } from 'svelte';
	import type { ChatbotSummary } from '$lib/data/chatbotTypes';
	import type { KbBrainSummary } from '$lib/data/knowledge/knowledgeTypes';
	import type { KbWorkbenchData } from '$lib/server/knowledge/kbWorkbenchData';
	import type { KnowledgeBase } from '$lib/server/knowledge/getKnowledgeBase';
	import type { KnowledgeBaseShare } from '$lib/server/knowledge/knowledgeBaseShares';
	import type { ProcessMapSummary } from '$lib/server/knowledge/getProcessMaps';

	let {
		knowledgeBase,
		isOwner,
		brains,
		processMaps,
		shares,
		chatbots,
		workbench,
		children
	}: {
		knowledgeBase: KnowledgeBase;
		isOwner: boolean;
		brains: KbBrainSummary[];
		processMaps: ProcessMapSummary[];
		shares: KnowledgeBaseShare[];
		chatbots: ChatbotSummary[];
		workbench: KbWorkbenchData;
		children: Snippet;
	} = $props();

	const dashboardTools = provideDashboardTools(() => !screen.isWideScreen);
	const slots = $derived(buildConstellationSlots(knowledgeBase.id, brains, processMaps));
	const openBrainId = $derived(page.params.brainId ?? null);
	const openSlot = $derived(slots.find((slot) => slot.id === openBrainId) ?? null);

	let isOutOfCredits = $state(false);

	onMount(() => {
		dashboardTools.left.open(openingKnowledgeBaseTool(page.url, isOwner, screen.isWideScreen));
	});
</script>

<div class="flex h-full w-full flex-col overflow-hidden bg-night lg:flex-row">
	<KnowledgeBaseToolset
		{knowledgeBase}
		{isOwner}
		openKind={openSlot?.kind ?? null}
		{shares}
		{chatbots}
		{workbench}
		onOutOfCredits={() => (isOutOfCredits = true)}
	/>
	<KnowledgeBaseRail
		knowledgeBaseId={knowledgeBase.id}
		isOnConstellation={openSlot === null}
		badgeCounts={{ review: workbench.proposals.length }}
	/>
	<DashboardPanel side="left" />
	<DashboardScene {knowledgeBase} {slots} {openBrainId} {isOutOfCredits}>
		{@render children()}
	</DashboardScene>
	<DashboardPanel side="right" />
</div>
