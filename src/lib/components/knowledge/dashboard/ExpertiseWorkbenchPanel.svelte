<script lang="ts">
	import ApiPanel from '../../brain/dashboard/ApiPanel.svelte';
	import BrainActivityLog from '../../brain/BrainActivityLog.svelte';
	import ReviewPanel from '../../brain/review/ReviewPanel.svelte';
	import SourcesPanel from '../../brain/SourcesPanel.svelte';
	import type { ExpertiseWorkbenchTool } from './knowledgeBaseTools';
	import type { Snippet } from 'svelte';
	import type { DomainBrain } from '$lib/server/entities/getDomainBrain';
	import type { KbWorkbenchData } from '$lib/server/knowledge/kbWorkbenchData';

	let {
		tool,
		isOwner,
		workbench,
		onOutOfCredits
	}: {
		tool: ExpertiseWorkbenchTool;
		isOwner: boolean;
		workbench: KbWorkbenchData;
		onOutOfCredits: () => void;
	} = $props();

	const panels: Record<ExpertiseWorkbenchTool, Snippet<[DomainBrain]>> = {
		documents,
		review,
		api,
		log
	};
</script>

{#snippet documents(primaryBrain: DomainBrain)}
	<div class="min-h-0 flex-1 overflow-y-auto">
		<SourcesPanel brainId={primaryBrain.id} {isOwner} sources={workbench.sources} {onOutOfCredits} />
	</div>
{/snippet}

{#snippet review(primaryBrain: DomainBrain)}
	<ReviewPanel brainId={primaryBrain.id} proposals={workbench.proposals} />
{/snippet}

{#snippet api(primaryBrain: DomainBrain)}
	<div class="min-h-0 flex-1 overflow-y-auto">
		<ApiPanel brainId={primaryBrain.id} tokens={workbench.apiTokens} />
	</div>
{/snippet}

{#snippet log(primaryBrain: DomainBrain)}
	<div class="min-h-0 flex-1 overflow-y-auto">
		<BrainActivityLog
			events={workbench.events}
			pageBasePath={`/workspace/${primaryBrain.entityId}/domains/${primaryBrain.id}`}
		/>
	</div>
{/snippet}

{#if workbench.primaryBrain === null}
	<p class="p-5 text-sm text-chalk/50">
		Add an Expertise Brain first — this tool wakes up once the knowledge base has one.
	</p>
{:else}
	{@render panels[tool](workbench.primaryBrain)}
{/if}
