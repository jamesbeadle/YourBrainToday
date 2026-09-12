<script lang="ts">
	import BrainStrip from './BrainStrip.svelte';
	import DashboardTopBar from './DashboardTopBar.svelte';
	import KbConstellation from '../KbConstellation.svelte';
	import OutOfCreditsNotice from '../../workspace/OutOfCreditsNotice.svelte';
	import { BrainFlight } from './brainFlight.svelte';
	import { provideBrainFlight } from './brainFlightContext';
	import { useDashboardTools } from './dashboardTools.svelte';
	import { createIntentPreloader } from './intentPreloader';
	import { galaxyPointerHint } from '../kb3d/kbGalaxyHint';
	import { knowledgeBaseHref } from '$lib/data/knowledge/knowledgeBaseRoutes';
	import { goto } from '$app/navigation';
	import { navigating } from '$app/state';
	import { onDestroy, type Snippet } from 'svelte';
	import type { ConstellationSlot } from '../constellationSlots';
	import type { KnowledgeBase } from '$lib/server/knowledge/getKnowledgeBase';

	let {
		knowledgeBase,
		slots,
		openBrainId,
		isOutOfCredits,
		children
	}: {
		knowledgeBase: KnowledgeBase;
		slots: ConstellationSlot[];
		openBrainId: string | null;
		isOutOfCredits: boolean;
		children: Snippet;
	} = $props();

	const dashboardTools = useDashboardTools();
	const preloader = createIntentPreloader();
	const hint = $derived(openBrainId === null ? galaxyPointerHint : null);

	let constellation = $state<KbConstellation>();

	const flight = provideBrainFlight(new BrainFlight(() => constellation, () => openBrainId));

	/** From the click until the view has drawn, the brain on its way is the one being opened. */
	const openingBrainId = $derived(navigating.to?.params?.brainId ?? flight.openingBrainId);
	const openSlot = $derived(slotWithId(openBrainId));
	const openingSlot = $derived(slotWithId(openingBrainId));

	function slotWithId(slotId: string | null): ConstellationSlot | null {
		return slots.find((slot) => slot.id === slotId) ?? null;
	}

	function selectSlot(slot: ConstellationSlot): void {
		if (slot.variant === 'brain') flight.flyInto(slot.id);
		goto(slot.href, { noScroll: true });
	}

	function intendSlot(slot: ConstellationSlot | null): void {
		preloader.intend(slot?.variant === 'brain' ? slot.href : null);
	}

	onDestroy(preloader.cancel);

	/** Escape backs out of a brain once there is no panel or menu left to close. */
	function returnHomeOnEscape(event: KeyboardEvent): void {
		if (event.defaultPrevented || event.key !== 'Escape') return;
		if (openBrainId === null || dashboardTools.hasOpenPanel) return;
		goto(knowledgeBaseHref(knowledgeBase.id), { noScroll: true });
	}
</script>

<svelte:window onkeydown={returnHomeOnEscape} />

<div class="relative min-h-0 min-w-0 flex-1">
	<KbConstellation
		bind:this={constellation}
		{slots}
		onHover={intendSlot}
		onSelect={selectSlot}
	/>
	{@render children()}
	<DashboardTopBar {knowledgeBase} {openSlot} {openingSlot} />
	<BrainStrip
		knowledgeBaseId={knowledgeBase.id}
		{slots}
		activeSlotId={openBrainId}
		{hint}
		onIntend={intendSlot}
		onSelect={selectSlot}
	/>
	{#if isOutOfCredits}
		<div class="absolute inset-x-4 top-16 z-20 overflow-hidden rounded-2xl border border-hairline">
			<OutOfCreditsNotice />
		</div>
	{/if}
</div>
