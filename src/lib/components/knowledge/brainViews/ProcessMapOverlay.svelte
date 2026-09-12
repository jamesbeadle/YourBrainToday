<script lang="ts">
	import TubeMap from '../../map/TubeMap.svelte';
	import WorkspaceMapNotice from '../../workspace/WorkspaceMapNotice.svelte';
	import { sceneHudPillClass, sceneHudPosition } from '../../brain/sceneHud';
	import { hasMapContent, type WorkflowModel } from '$lib/data/workflowModel';
	import { layoutWorkflowMap } from '$lib/data/mapLayout';
	import type { StationSelection } from '../../map/stationSelection';
	import type { RoleLine, Station } from '$lib/data/types';

	let {
		model,
		selection,
		creditBalance,
		onSelectStation,
		onClose
	}: {
		model: WorkflowModel;
		selection: StationSelection | null;
		creditBalance: number | null;
		onSelectStation: (selection: StationSelection) => void;
		onClose: () => void;
	} = $props();

	const layout = $derived(layoutWorkflowMap(model));
	const selectedStationId = $derived(selection === null ? null : selection.station.id);

	function selectStation(line: RoleLine, station: Station): void {
		onSelectStation({ line, station });
	}
</script>

<div class="absolute inset-0 z-10 bg-night">
	<div class="absolute inset-0 overflow-y-auto overscroll-contain p-4 pt-16 pb-32 lg:pb-4">
		{#if hasMapContent(model)}
			<TubeMap
				lines={layout.lines}
				viewBox={layout.viewBox}
				{selectedStationId}
				onSelectStation={selectStation}
			/>
		{:else}
			<WorkspaceMapNotice {creditBalance} />
		{/if}
	</div>
	<button
		type="button"
		onclick={onClose}
		class={[sceneHudPosition, sceneHudPillClass, 'min-h-11 font-display text-sm lg:min-h-0']}
	>
		✕ Close the map
	</button>
</div>
