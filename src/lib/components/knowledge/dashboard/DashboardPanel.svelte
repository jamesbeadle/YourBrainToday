<script lang="ts">
	import DashboardPanelHeader from './DashboardPanelHeader.svelte';
	import DashboardSheet from './DashboardSheet.svelte';
	import { dashboardMotion, panelEasing } from './dashboardMotion';
	import { useDashboardTools, type ToolSide } from './dashboardTools.svelte';
	import { screen } from '$lib/client/screen.svelte';
	import { fly } from 'svelte/transition';

	let { side }: { side: ToolSide } = $props();

	const columnWidthPixels = 380;
	const columnEdgeClass: Record<ToolSide, string> = {
		left: 'border-r border-hairline',
		right: 'border-l border-hairline'
	};
	const slideFromPixels: Record<ToolSide, number> = {
		left: -columnWidthPixels,
		right: columnWidthPixels
	};

	const dashboardTools = useDashboardTools();
	const tools = $derived(dashboardTools.side(side));
	const activeTool = $derived(tools.activeTool);

	const isBehindTheBrainPanel = $derived(side === 'left' && dashboardTools.right.hasOpenPanel);

	/** Escape closes one panel at a time, the brain's before the knowledge base's. */
	function closeOnEscape(event: KeyboardEvent): void {
		if (event.defaultPrevented || event.key !== 'Escape' || activeTool === null) return;
		if (isBehindTheBrainPanel) return;
		tools.close();
	}
</script>

<svelte:window onkeydown={closeOnEscape} />

{#if activeTool !== null}
	{#if screen.isWideScreen}
		<aside
			class={['flex shrink-0 flex-col bg-night', columnEdgeClass[side]]}
			style:width={`${columnWidthPixels}px`}
			transition:fly|global={{
				x: slideFromPixels[side],
				duration: dashboardMotion.panelSlideMilliseconds,
				easing: panelEasing,
				opacity: 1
			}}
		>
			<DashboardPanelHeader title={activeTool.label} onClose={() => tools.close()} />
			<div class="flex min-h-0 flex-1 flex-col overflow-hidden">
				{@render activeTool.panel()}
			</div>
		</aside>
	{:else}
		<DashboardSheet title={activeTool.label} onClose={() => tools.close()}>
			{@render activeTool.panel()}
		</DashboardSheet>
	{/if}
{/if}
