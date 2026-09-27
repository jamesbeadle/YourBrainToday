<script lang="ts">
	import BrainConstellation from '../../brain/BrainConstellation.svelte';
	import BrainEditor from '../BrainEditor.svelte';
	import BrainQueryPanel from '../BrainQueryPanel.svelte';
	import KindBrainSettingsPanel from '../KindBrainSettingsPanel.svelte';
	import { brainToolKeysFor, brainTools, brainToolsOwnerFor } from './brainViewTools';
	import { buildHumanConstellation } from '../../brain/people/humanConstellation';
	import { humanVocabulary } from '../../brain/people/humanVocabulary';
	import { personPage } from '../../brain/people/personPage';
	import { useDashboardTools } from '../dashboard/dashboardTools.svelte';
	import { brainHref } from '$lib/data/knowledge/knowledgeBaseRoutes';
	import type { HumanBrainView } from '$lib/server/knowledge/brainViews/loadHumanBrainView';

	let {
		knowledgeBaseId,
		isOwner,
		view,
		onReady
	}: {
		knowledgeBaseId: string;
		isOwner: boolean;
		view: HumanBrainView;
		onReady: () => void;
	} = $props();

	const toolbarTools = useDashboardTools().right;
	const brain = $derived(view.brain);
	const constellation = $derived(buildHumanConstellation(view.items));
	const actionBasePath = $derived(brainHref(knowledgeBaseId, brain.id));
	const toolKeys = $derived(brainToolKeysFor(['ask', 'contents'], 'settings', isOwner));

	$effect(() => {
		const toolsOwner = brainToolsOwnerFor('human', brain.id);
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
		<BrainEditor editor="people" items={view.items} schemaTypes={[]} dddEditorHref={null} />
	</div>
{/snippet}

{#snippet settings()}
	<KindBrainSettingsPanel
		{brain}
		domainBrains={[]}
		boundDomainBrainIds={[]}
		{isOwner}
		{actionBasePath}
	/>
{/snippet}

<BrainConstellation
	loadPage={(personId) => personPage(view.items, personId)}
	pageBasePath={null}
	contexts={constellation.contexts}
	pageIndex={constellation.pageIndex}
	pageLinks={constellation.pageLinks}
	vocabulary={humanVocabulary}
	{onReady}
/>
