<script lang="ts">
	import FlowBrain from '$lib/components/brain/FlowBrain.svelte';
	import SectionPanel from '$lib/components/brain/dashboard/SectionPanel.svelte';
	import SectionRail from '$lib/components/brain/dashboard/SectionRail.svelte';
	import ShareMapPanel from '$lib/components/workspace/ShareMapPanel.svelte';
	import WorkspaceChat from '$lib/components/workspace/WorkspaceChat.svelte';
	import WorkspaceMap from '$lib/components/workspace/WorkspaceMap.svelte';
	import WorkspaceMapNotice from '$lib/components/workspace/WorkspaceMapNotice.svelte';
	import { findKnowledgeKind } from '$lib/data/knowledge/knowledgeKinds';
	import { hasMapContent, type WorkflowModel } from '$lib/data/workflowModel';
	import { screen } from '$lib/client/screen.svelte';
	import { onMount } from 'svelte';
	import type { SectionKey } from '$lib/components/brain/dashboard/railIcons';

	let { data } = $props();

	let model: WorkflowModel = $derived(data.latestMap);
	let activeSection = $state<SectionKey | null>(null);

	const sections: SectionKey[] = ['interview', 'map', 'share'];
	const processKind = findKnowledgeKind('process');
	const isMapDrawn = $derived(hasMapContent(model));

	onMount(() => {
		if (screen.isWideScreen) activeSection = 'interview';
	});

	function toggleSection(section: SectionKey): void {
		activeSection = activeSection === section ? null : section;
	}
</script>

<svelte:head>
	<title>{data.workflow.name} — Your Brain Today</title>
</svelte:head>

<div class="flex h-[calc(100dvh-3.5rem)] flex-col overflow-hidden bg-night lg:flex-row">
	<div class="order-2 lg:order-1 lg:contents">
		<SectionRail {sections} {activeSection} onSelect={toggleSection} />
	</div>
	<div class="relative order-1 flex min-h-0 min-w-0 flex-1 lg:order-2">
		{#if activeSection === 'interview' || activeSection === 'share'}
			<SectionPanel section={activeSection} onClose={() => (activeSection = null)}>
				{#if activeSection === 'interview'}
					<WorkspaceChat
						workflowId={data.workflow.id}
						initialMessages={data.messages}
						onMapUpdate={(updatedModel) => (model = updatedModel)}
						frame="panel"
					/>
				{:else}
					<div class="min-h-0 flex-1 overflow-y-auto p-4">
						<ShareMapPanel viewers={data.viewers} />
					</div>
				{/if}
			</SectionPanel>
		{/if}
		<div class="relative min-w-0 flex-1">
			{#if activeSection === 'map'}
				<div class="absolute inset-0 z-20 overflow-y-auto bg-night p-4">
					{#if isMapDrawn}
						<WorkspaceMap {model} />
					{:else}
						<WorkspaceMapNotice creditBalance={data.creditBalance} />
					{/if}
				</div>
			{/if}
			<FlowBrain {model} seed={data.workflow.id} />
			<div class="pointer-events-none absolute top-4 right-4 z-10 flex flex-col items-end gap-0.5 text-right">
				<h1 class="font-display text-lg font-medium text-chalk">{data.workflow.name}</h1>
				<p
					class="font-mono text-[10px] tracking-widest uppercase"
					style={`color: ${processKind.accent}`}
				>
					Process brain
				</p>
			</div>
			<div class="absolute inset-x-0 bottom-0 z-10 flex items-center px-4 py-2">
				<a
					href={data.backHref}
					class="font-display text-xs text-chalk/50 transition hover:text-chalk"
				>
					← Knowledge Base
				</a>
			</div>
		</div>
	</div>
</div>
