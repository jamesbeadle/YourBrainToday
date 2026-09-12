<script lang="ts">
	import BrainEditor from '../BrainEditor.svelte';
	import BrainQueryPanel from '../BrainQueryPanel.svelte';
	import KindBrainSettingsPanel from '../KindBrainSettingsPanel.svelte';
	import RegionBrain from '../../brain/RegionBrain.svelte';
	import { brainToolKeysFor, brainTools, brainToolsOwnerFor } from './brainViewTools';
	import { findBrainType } from '$lib/data/knowledge/brainTypeCatalog';
	import { useDashboardTools } from '../dashboard/dashboardTools.svelte';
	import { brainHref } from '$lib/data/knowledge/knowledgeBaseRoutes';
	import type { ExperienceBrainView } from '$lib/server/knowledge/brainViews/loadExperienceBrainView';

	let {
		knowledgeBaseId,
		isOwner,
		view,
		onReady
	}: {
		knowledgeBaseId: string;
		isOwner: boolean;
		view: ExperienceBrainView;
		onReady: () => void;
	} = $props();

	const toolbarTools = useDashboardTools().right;
	const brain = $derived(view.brain);
	const editor = $derived(findBrainType(brain.brainType)?.editor ?? 'notes');
	const actionBasePath = $derived(brainHref(knowledgeBaseId, brain.id));
	const toolKeys = $derived(brainToolKeysFor(['ask', 'contents'], 'settings', isOwner));

	$effect(() => {
		const toolsOwner = brainToolsOwnerFor('experience', brain.id);
		const tools = brainTools(toolKeys, { ask, contents, settings });
		toolbarTools.register(toolsOwner, tools);
		return () => toolbarTools.release(toolsOwner);
	});
</script>

{#snippet ask()}
	<BrainQueryPanel brainId={brain.id} />
{/snippet}

{#snippet contents()}
	<div class="min-h-0 flex-1 overflow-y-auto p-4">
		<BrainEditor
			{editor}
			items={view.items}
			schemaTypes={view.schemaTypes}
			dddEditorHref={view.dddEditorHref}
		/>
	</div>
{/snippet}

{#snippet settings()}
	<KindBrainSettingsPanel
		{brain}
		domainBrains={view.domainBrains}
		boundDomainBrainIds={view.boundDomainBrainIds}
		{isOwner}
		{actionBasePath}
	/>
{/snippet}

<RegionBrain items={view.items} seed={brain.id} {onReady} />
