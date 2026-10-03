<script lang="ts">
	import { viewFadeMilliseconds } from '../dashboard/dashboardMotion';
	import { topRowHeightPixels } from '../dashboard/dashboardLayout';
	import { useBrainFlight } from '../dashboard/brainFlightContext';
	import { fade } from 'svelte/transition';
	import type { Snippet } from 'svelte';

	let {
		label,
		isInsideBrain = false,
		children
	}: { label: string; isInsideBrain?: boolean; children: Snippet } = $props();

	const flight = useBrainFlight();

	/** A reader inside a brain rests the galaxy behind it once this frame has painted, as a brain view does. */
	$effect(() => {
		if (!isInsideBrain) return;
		const paintedFrame = requestAnimationFrame(() => flight.settleBehindView(0));
		return () => cancelAnimationFrame(paintedFrame);
	});
</script>

<section
	aria-label={label}
	class="absolute inset-0 z-20 bg-night"
	in:fade={{ duration: viewFadeMilliseconds() }}
	out:fade={{ duration: viewFadeMilliseconds() }}
>
	<div class="absolute inset-x-0 bottom-0 overflow-y-auto" style:top={`${topRowHeightPixels}px`}>
		{@render children()}
	</div>
</section>
