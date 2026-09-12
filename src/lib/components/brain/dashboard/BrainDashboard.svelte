<script lang="ts">
	import BrainDashboardPanels from './BrainDashboardPanels.svelte';
	import BrainStage from './BrainStage.svelte';
	import SectionPanel from './SectionPanel.svelte';
	import SectionRail from './SectionRail.svelte';
	import { sectionsForRole, type SectionKey } from './railIcons';
	import { screen } from '$lib/client/screen.svelte';
	import { onMount } from 'svelte';
	import type { BrainAccessRole } from '$lib/data/marketTypes';
	import type { DomainBrain } from '$lib/server/entities/getDomainBrain';
	import type { KnowledgeBaseSummary } from '$lib/data/knowledge/knowledgeTypes';
	import type {
		BrainContext,
		BrainConversationThread,
		BrainPageLink,
		BrainPageSummary
	} from '$lib/data/brainTypes';

	let {
		brain,
		accessRole,
		contexts,
		pageIndex,
		pageLinks,
		conversation,
		knowledgeBases,
		filedKnowledgeBaseId,
		filedKnowledgeBaseName,
		backHref
	}: {
		brain: DomainBrain;
		accessRole: BrainAccessRole;
		contexts: BrainContext[];
		pageIndex: BrainPageSummary[];
		pageLinks: BrainPageLink[];
		conversation: BrainConversationThread;
		knowledgeBases: KnowledgeBaseSummary[];
		filedKnowledgeBaseId: string | null;
		filedKnowledgeBaseName: string | null;
		backHref: string;
	} = $props();

	const isOwner = $derived(accessRole === 'owner');
	const pageBasePath = $derived(`/workspace/${brain.entityId}/domains/${brain.id}`);

	let activeSection = $state<SectionKey | null>(null);
	let isOutOfCredits = $state(false);
	let stage = $state<BrainStage>();

	onMount(() => {
		if (screen.isWideScreen) activeSection = 'terminal';
	});

	function toggleSection(section: SectionKey): void {
		activeSection = activeSection === section ? null : section;
	}

	function openPageInBrain(slug: string): void {
		if (!screen.isWideScreen) activeSection = null;
		stage?.drillToNeuron(slug);
	}
</script>

<div class="flex h-[calc(100dvh-3.5rem)] flex-col overflow-hidden bg-night lg:flex-row">
	<div class="order-2 lg:order-1 lg:contents">
		<SectionRail sections={sectionsForRole[accessRole]} {activeSection} onSelect={toggleSection} />
	</div>
	<div class="relative order-1 flex min-h-0 min-w-0 flex-1 lg:order-2">
		{#if activeSection !== null}
			<SectionPanel section={activeSection} onClose={() => (activeSection = null)}>
				<BrainDashboardPanels
					section={activeSection}
					{brain}
					{conversation}
					{contexts}
					{pageIndex}
					{pageBasePath}
					{knowledgeBases}
					{filedKnowledgeBaseId}
					{filedKnowledgeBaseName}
					{isOwner}
					onOutOfCredits={() => (isOutOfCredits = true)}
					onSelectPage={openPageInBrain}
				/>
			</SectionPanel>
		{/if}
		<BrainStage
			bind:this={stage}
			brainId={brain.id}
			{pageBasePath}
			{contexts}
			{pageIndex}
			{pageLinks}
			{backHref}
			backLabel={filedKnowledgeBaseName ?? 'Knowledge Base'}
			{isOwner}
			{isOutOfCredits}
		/>
	</div>
</div>
