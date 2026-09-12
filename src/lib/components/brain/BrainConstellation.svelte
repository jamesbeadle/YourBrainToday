<script lang="ts">
	import ConstellationOverlays from './ConstellationOverlays.svelte';
	import { buildConstellationModel } from './constellation/buildConstellationModel';
	import { createConstellationExploration } from './constellation/constellationExploration.svelte';
	import { restWhilePageHidden } from '$lib/client/pageVisibility.svelte';
	import { untrack } from 'svelte';
	import {
		createConstellationExperience,
		type ConstellationExperience
	} from './constellation/createConstellationExperience';
	import type { BrainPagePayload } from './constellation/fetchBrainPage';
	import type { BrainContext, BrainPageLink, BrainPageSummary } from '$lib/data/brainTypes';

	let {
		loadPage,
		pageBasePath,
		contexts,
		pageIndex,
		pageLinks,
		onReady = () => {}
	}: {
		loadPage: (slug: string) => Promise<BrainPagePayload>;
		pageBasePath: string | null;
		contexts: BrainContext[];
		pageIndex: BrainPageSummary[];
		pageLinks: BrainPageLink[];
		onReady?: () => void;
	} = $props();

	const model = $derived(buildConstellationModel(contexts, pageIndex, pageLinks));
	const hasNeurons = $derived(model.neurons.length > 0 || model.nuclei.length > 0);

	let containerElement = $state<HTMLDivElement>();
	let canvasElement = $state<HTMLCanvasElement>();
	let experience = $state<ConstellationExperience>();
	let hasWatchedEmptyBrain = false;

	const exploration = createConstellationExploration({
		pageIndex: () => pageIndex,
		experience: () => experience
	});

	$effect(() => {
		if (canvasElement === undefined || containerElement === undefined) return;
		const mounted = createConstellationExperience(
			canvasElement,
			containerElement,
			untrack(() => model),
			exploration.callbacks,
			{ shouldCascadeInitialModel: hasWatchedEmptyBrain, onReady }
		);
		experience = mounted;
		return () => mounted.destroy();
	});

	$effect(() => {
		if (!hasNeurons) hasWatchedEmptyBrain = true;
		experience?.updateModel(model);
	});

	$effect(() => {
		if (!hasNeurons) untrack(onReady);
	});

	restWhilePageHidden(() => experience);

	export function drillToNeuron(slug: string): void {
		exploration.rememberSelection(slug);
		experience?.focusNeuron(slug);
	}
</script>

{#if hasNeurons}
	<div bind:this={containerElement} class="relative h-full min-h-80 overflow-hidden bg-night">
		<canvas bind:this={canvasElement} class="h-full w-full"></canvas>
		<ConstellationOverlays {exploration} {loadPage} {pageBasePath} {contexts} {pageIndex} />
	</div>
{:else}
	<div class="flex h-full min-h-80 items-center justify-center text-sm text-chalk/50">
		No neurons yet — add your first document and watch the constellation grow.
	</div>
{/if}
