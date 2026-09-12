<script lang="ts">
	import { viewFadeMilliseconds } from './dashboardMotion';
	import { topRowHeightPixels } from './dashboardLayout';
	import { useBrainFlight } from './brainFlightContext';
	import { fade } from 'svelte/transition';
	import type { Snippet } from 'svelte';
	import type { OpenBrain } from '$lib/data/knowledge/findOpenBrain';

	let { brain, children }: { brain: OpenBrain; children: Snippet<[() => void]> } = $props();

	const flight = useBrainFlight();

	let isRevealed = $state(false);
	let fadeDelayMilliseconds = $state(0);
	let fadeMilliseconds = $state(0);

	/**
	 * The scene has drawn its first frame. The view fades in over the galaxy
	 * once the camera has landed, and the galaxy rests behind it after that.
	 */
	function reveal(): void {
		if (isRevealed) return;
		fadeDelayMilliseconds = flight.viewFadeDelayMilliseconds;
		fadeMilliseconds = viewFadeMilliseconds();
		isRevealed = true;
		flight.settleBehindView(fadeDelayMilliseconds + fadeMilliseconds);
	}
</script>

<section
	aria-label={brain.name}
	class={[
		'absolute inset-0 z-20 bg-night transition-opacity ease-out',
		isRevealed ? 'opacity-100' : 'opacity-0'
	]}
	style:transition-duration={`${fadeMilliseconds}ms`}
	style:transition-delay={`${fadeDelayMilliseconds}ms`}
	out:fade={{ duration: viewFadeMilliseconds() }}
>
	<div class="absolute inset-x-0 bottom-0" style:top={`${topRowHeightPixels}px`}>
		{@render children(reveal)}
	</div>
</section>
