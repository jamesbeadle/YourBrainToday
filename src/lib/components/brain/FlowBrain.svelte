<script lang="ts">
	import FlowTooltip from './FlowTooltip.svelte';
	import { buildFlowModel } from './flow/buildFlowModel';
	import { createFlowExperience, type FlowExperience } from './flow/createFlowExperience';
	import { hasMapContent, type WorkflowModel } from '$lib/data/workflowModel';
	import { sceneHintPosition, sceneHudPillClass, sceneHudPosition } from './sceneHud';
	import { restWhilePageHidden } from '$lib/client/pageVisibility.svelte';
	import { untrack } from 'svelte';
	import type { FlowHover } from './flow/flowTypes';

	let {
		model,
		seed,
		onSelectNode = () => {},
		onReady = () => {}
	}: {
		model: WorkflowModel;
		seed: string;
		onSelectNode?: (nodeId: string | null) => void;
		onReady?: () => void;
	} = $props();

	const flow = $derived(buildFlowModel(model, seed));
	const hint = $derived(
		hasMapContent(model)
			? 'watch the work travel · hover a station · click to fly in'
			: 'no process mapped yet · the interview draws it'
	);

	let containerElement = $state<HTMLDivElement>();
	let canvasElement = $state<HTMLCanvasElement>();
	let experience = $state<FlowExperience>();
	let hover = $state<FlowHover | null>(null);
	let focusedNodeId = $state<string | null>(null);

	const hoveredNode = $derived(flow.nodes.find((node) => node.id === hover?.nodeId));
	const hoveredEdge = $derived(flow.edges.find((edge) => edge.id === hover?.edgeId));
	const focusedNode = $derived(flow.nodes.find((node) => node.id === focusedNodeId));

	function roleNameFor(nodeId: string): string {
		return flow.nodes.find((node) => node.id === nodeId)?.roleName ?? 'nowhere';
	}

	$effect(() => {
		if (canvasElement === undefined || containerElement === undefined) return;
		const callbacks = {
			onHover: (candidate: FlowHover | null) => (hover = candidate),
			onSelectNode: (nodeId: string | null) => {
				focusedNodeId = nodeId;
				onSelectNode(nodeId);
			}
		};
		const mounted = createFlowExperience(
			canvasElement,
			containerElement,
			untrack(() => flow),
			callbacks,
			{ onReady }
		);
		experience = mounted;
		return () => mounted.destroy();
	});

	$effect(() => {
		experience?.updateModel(flow);
	});

	restWhilePageHidden(() => experience);

	function returnToWholeBrain(): void {
		focusedNodeId = null;
		experience?.resetView();
		onSelectNode(null);
	}
</script>

<div bind:this={containerElement} class="relative h-full w-full overflow-hidden bg-night">
	<canvas bind:this={canvasElement} class="block h-full w-full"></canvas>
	{#if focusedNode !== undefined}
		<nav class={[sceneHudPosition, 'flex flex-wrap items-center gap-2 font-display text-sm']}>
			<button type="button" onclick={returnToWholeBrain} class={sceneHudPillClass}>
				Whole brain
			</button>
			<span class="text-chalk/40">/</span>
			<span class="rounded-full border border-hairline bg-night/70 px-3 py-1 text-chalk backdrop-blur">
				{focusedNode.name}
			</span>
		</nav>
	{/if}
	{#if hover !== null && (hoveredNode !== undefined || hoveredEdge !== undefined)}
		<FlowTooltip {hover} node={hoveredNode} edge={hoveredEdge} {roleNameFor} />
	{/if}
	<p class={[sceneHintPosition, 'font-display text-[10px] tracking-widest text-chalk/25 uppercase']}>
		{hint}
	</p>
</div>
