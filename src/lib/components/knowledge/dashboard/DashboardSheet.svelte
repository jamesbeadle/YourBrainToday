<script lang="ts">
	import DashboardPanelHeader from './DashboardPanelHeader.svelte';
	import { dashboardMotion, panelEasing } from './dashboardMotion';
	import { SheetDrag } from './sheetDrag.svelte';
	import { fade, fly } from 'svelte/transition';
	import type { Snippet } from 'svelte';

	let {
		title,
		onClose,
		children
	}: { title: string; onClose: () => void; children: Snippet } = $props();

	const sheetHeight = '85dvh';
	const drag = new SheetDrag(() => onClose());

	$effect(() => {
		const restingOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => (document.body.style.overflow = restingOverflow);
	});
</script>

<button
	type="button"
	aria-label="Close panel"
	class="fixed inset-0 z-40 bg-night/70"
	transition:fade|global={{ duration: dashboardMotion.scrimFadeMilliseconds }}
	onclick={onClose}
></button>
<section
	aria-label={title}
	class={[
		'fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-3xl border-t border-hairline bg-night',
		!drag.isDragging && 'transition-transform ease-out'
	]}
	style:height={sheetHeight}
	style:transform={`translateY(${drag.offsetPixels}px)`}
	style:transition-duration={`${dashboardMotion.panelSlideMilliseconds}ms`}
	transition:fly|global={{
		y: '100%',
		duration: dashboardMotion.panelSlideMilliseconds,
		easing: panelEasing,
		opacity: 1
	}}
>
	<div
		aria-hidden="true"
		class="flex h-10 shrink-0 cursor-grab touch-none items-center justify-center select-none"
		onpointerdown={drag.begin}
		onpointermove={drag.follow}
		onpointerup={drag.release}
		onpointercancel={drag.cancel}
	>
		<div class="h-1 w-10 rounded-full bg-hairline"></div>
	</div>
	<DashboardPanelHeader {title} {onClose} />
	<div class="flex min-h-0 flex-1 flex-col overflow-hidden">
		{@render children()}
	</div>
</section>
