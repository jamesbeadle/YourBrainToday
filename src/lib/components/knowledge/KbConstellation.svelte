<script lang="ts">
	import { createKbGalaxy, type KbGalaxyExperience } from './kb3d/createKbGalaxy';
	import type { FocusOptions } from './kb3d/kbGalaxyFocus';
	import { untrack } from 'svelte';
	import type { ConstellationSlot } from './constellationSlots';

	let {
		slots,
		onHover,
		onSelect
	}: {
		slots: ConstellationSlot[];
		onHover: (slot: ConstellationSlot | null) => void;
		onSelect: (slot: ConstellationSlot) => void;
	} = $props();

	let containerElement = $state<HTMLDivElement>();
	let canvasElement = $state<HTMLCanvasElement>();
	let galaxy: KbGalaxyExperience | null = null;
	let shownSlots: ConstellationSlot[] | null = null;
	let focusedSlotId: string | null = null;
	let isPaused = false;
	let isHidden = $state(false);

	export function focusSlot(slotId: string, options: FocusOptions = {}): void {
		focusedSlotId = slotId;
		galaxy?.focusSlot(slotId, options);
	}

	export function releaseFocus(): void {
		focusedSlotId = null;
		galaxy?.releaseFocus();
	}

	export function pause(): void {
		isPaused = true;
		galaxy?.pause();
	}

	export function resume(): void {
		isPaused = false;
		galaxy?.resume();
	}

	/** Once a brain's view covers the galaxy there is nothing to see, so the canvas rests unseen. */
	export function hide(): void {
		isHidden = true;
	}

	export function show(): void {
		isHidden = false;
	}

	function applyIntent(created: KbGalaxyExperience): void {
		if (focusedSlotId !== null) created.focusSlot(focusedSlotId, { isInstant: true });
		if (isPaused) created.pause();
	}

	$effect(() => {
		if (canvasElement === undefined || containerElement === undefined) return;
		const initialSlots = untrack(() => slots);
		const created = createKbGalaxy(canvasElement, containerElement, initialSlots, {
			onHover,
			onActivate: onSelect
		});
		applyIntent(created);
		galaxy = created;
		shownSlots = initialSlots;
		return () => {
			created.destroy();
			galaxy = null;
		};
	});

	$effect(() => {
		if (galaxy === null || shownSlots === slots) return;
		galaxy.updateSlots(slots);
		shownSlots = slots;
	});
</script>

<div
	bind:this={containerElement}
	class={['relative h-full w-full overflow-hidden bg-night', isHidden && 'invisible']}
>
	<canvas bind:this={canvasElement} class="block h-full w-full"></canvas>
</div>
