<script lang="ts">
	import RegionTooltip from './RegionTooltip.svelte';
	import { buildRegionModel } from './regions/buildRegionModel';
	import { restWhilePageHidden } from '$lib/client/pageVisibility.svelte';
	import { untrack } from 'svelte';
	import {
		createRegionExperience,
		type RegionExperience
	} from './regions/createRegionExperience';
	import { asCssColour } from './constellation/constellationPalette';
	import { sceneHintPosition, sceneHudPillClass, sceneHudPosition } from './sceneHud';
	import type { RegionHover } from './regions/regionTypes';
	import type { KbBrainItem } from '$lib/data/knowledge/knowledgeTypes';

	let {
		items,
		seed,
		onSelectRegion = () => {},
		onReady = () => {}
	}: {
		items: KbBrainItem[];
		seed: string;
		onSelectRegion?: (regionId: string | null) => void;
		onReady?: () => void;
	} = $props();

	const model = $derived(buildRegionModel(items, seed));
	const hint = $derived(
		items.length === 0
			? 'no experiences filed yet · the interview fills this brain'
			: 'hover a section to light it up · click to fly in'
	);

	let containerElement = $state<HTMLDivElement>();
	let canvasElement = $state<HTMLCanvasElement>();
	let experience = $state<RegionExperience>();
	let hover = $state<RegionHover | null>(null);
	let focusedRegionId = $state<string | null>(null);

	const hoveredRegion = $derived(model.regions.find((region) => region.id === hover?.regionId));
	const focusedRegion = $derived(model.regions.find((region) => region.id === focusedRegionId));

	$effect(() => {
		if (canvasElement === undefined || containerElement === undefined) return;
		const callbacks = {
			onHover: (candidate: RegionHover | null) => (hover = candidate),
			onSelectRegion: (regionId: string | null) => {
				focusedRegionId = regionId;
				onSelectRegion(regionId);
			}
		};
		const mounted = createRegionExperience(
			canvasElement,
			containerElement,
			untrack(() => model),
			callbacks,
			{ onReady }
		);
		experience = mounted;
		return () => mounted.destroy();
	});

	$effect(() => {
		experience?.updateModel(model);
	});

	restWhilePageHidden(() => experience);

	function returnToWholeBrain(): void {
		focusedRegionId = null;
		experience?.resetView();
		onSelectRegion(null);
	}
</script>

<div bind:this={containerElement} class="relative h-full w-full overflow-hidden bg-night">
	<canvas bind:this={canvasElement} class="block h-full w-full"></canvas>
	{#if focusedRegion !== undefined}
		<nav class={[sceneHudPosition, 'flex flex-wrap items-center gap-2 font-display text-sm']}>
			<button type="button" onclick={returnToWholeBrain} class={sceneHudPillClass}>
				Whole brain
			</button>
			<span class="text-chalk/40">/</span>
			<span
				class="rounded-full border bg-night/70 px-3 py-1 backdrop-blur"
				style={`border-color: ${asCssColour(focusedRegion.colour)}80; color: ${asCssColour(focusedRegion.colour)}`}
			>
				{focusedRegion.name}
			</span>
		</nav>
	{/if}
	{#if hover !== null && hoveredRegion !== undefined}
		<RegionTooltip {hover} region={hoveredRegion} />
	{/if}
	<p class={[sceneHintPosition, 'font-display text-[10px] tracking-widest text-chalk/25 uppercase']}>
		{hint}
	</p>
</div>
