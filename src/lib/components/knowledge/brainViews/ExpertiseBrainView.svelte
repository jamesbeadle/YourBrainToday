<script lang="ts">
	import BrainConstellation from '../../brain/BrainConstellation.svelte';
	import BrainTerminal from '../../brain/dashboard/BrainTerminal.svelte';
	import DomainModelIndex from '../../brain/DomainModelIndex.svelte';
	import ExpertiseSettingsPanel from './ExpertiseSettingsPanel.svelte';
	import OutOfCreditsNotice from '../../workspace/OutOfCreditsNotice.svelte';
	import PruneKnowledgeButton from '../../brain/PruneKnowledgeButton.svelte';
	import { brainToolKeysFor, brainTools, brainToolsOwnerFor } from './brainViewTools';
	import { fetchBrainPage } from '../../brain/constellation/fetchBrainPage';
	import { useDashboardTools } from '../dashboard/dashboardTools.svelte';
	import { brainHref } from '$lib/data/knowledge/knowledgeBaseRoutes';
	import { screen } from '$lib/client/screen.svelte';
	import type { ExpertiseBrainView } from '$lib/server/knowledge/brainViews/loadExpertiseBrainView';

	let {
		knowledgeBaseId,
		brainId,
		view,
		onReady
	}: {
		knowledgeBaseId: string;
		brainId: string;
		view: ExpertiseBrainView;
		onReady: () => void;
	} = $props();

	const toolbarTools = useDashboardTools().right;
	const isOwner = $derived(view.accessRole === 'owner');
	const pageBasePath = $derived(`/workspace/${view.brain.entityId}/domains/${view.brain.id}`);
	const actionBasePath = $derived(brainHref(knowledgeBaseId, brainId));
	const toolKeys = $derived(brainToolKeysFor(['ask', 'model'], 'settings', isOwner));

	let constellation = $state<BrainConstellation>();
	let isOutOfCredits = $state(false);

	$effect(() => {
		const toolsOwner = brainToolsOwnerFor('expertise', brainId);
		const tools = brainTools(toolKeys, { ask, model, settings });
		toolbarTools.register(toolsOwner, tools);
		return () => toolbarTools.release(toolsOwner);
	});

	function openPageInBrain(slug: string): void {
		if (!screen.isWideScreen) toolbarTools.close();
		constellation?.drillToNeuron(slug);
	}
</script>

{#snippet ask()}
	<BrainTerminal
		brainId={view.brain.id}
		conversationId={view.conversation.conversationId}
		messages={view.conversation.messages}
		pageIndex={view.pageIndex}
		{pageBasePath}
		onOutOfCredits={() => (isOutOfCredits = true)}
	/>
{/snippet}

{#snippet model()}
	<div class="min-h-0 flex-1 overflow-y-auto">
		{#if isOwner}
			<div class="px-4 pt-4">
				<PruneKnowledgeButton brainId={view.brain.id} onOutOfCredits={() => (isOutOfCredits = true)} />
			</div>
		{/if}
		<DomainModelIndex
			contexts={view.contexts}
			pageIndex={view.pageIndex}
			{pageBasePath}
			onSelectPage={openPageInBrain}
		/>
	</div>
{/snippet}

{#snippet settings()}
	<ExpertiseSettingsPanel brain={view.brain} {actionBasePath} />
{/snippet}

<BrainConstellation
	bind:this={constellation}
	loadPage={(slug) => fetchBrainPage(view.brain.id, slug)}
	{pageBasePath}
	contexts={view.contexts}
	pageIndex={view.pageIndex}
	pageLinks={view.pageLinks}
	{onReady}
/>
{#if isOutOfCredits}
	<div class="absolute inset-x-4 top-4 z-20 overflow-hidden rounded-2xl border border-hairline">
		<OutOfCreditsNotice />
	</div>
{/if}
