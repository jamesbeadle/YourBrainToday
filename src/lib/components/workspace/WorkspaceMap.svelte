<script lang="ts">
	import LineLegend from '../map/LineLegend.svelte';
	import StationDetailPanel from '../map/StationDetailPanel.svelte';
	import TubeMap from '../map/TubeMap.svelte';
	import { layoutWorkflowMap } from '$lib/data/mapLayout';
	import type { StationSelection } from '../map/stationSelection';
	import type { RoleLine, Station } from '$lib/data/types';
	import type { WorkflowModel } from '$lib/data/workflowModel';

	let { model }: { model: WorkflowModel } = $props();

	const layout = $derived(layoutWorkflowMap(model));
	let selection = $state<StationSelection | null>(null);

	const selectedStationId = $derived(selection === null ? null : selection.station.id);

	function selectStation(line: RoleLine, station: Station) {
		selection = { line, station };
	}
</script>

<section class="flex flex-col gap-4">
	<LineLegend lines={layout.lines} />
	<div class="grid items-start gap-6 lg:grid-cols-[2fr_1fr]">
		<TubeMap
			lines={layout.lines}
			viewBox={layout.viewBox}
			{selectedStationId}
			onSelectStation={selectStation}
		/>
		<StationDetailPanel {selection} />
	</div>
</section>
