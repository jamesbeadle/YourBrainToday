<script lang="ts">
	import type { RoleLine, Station } from '$lib/data/types';
	import MapStation from './MapStation.svelte';
	import TubeLinePath from './TubeLinePath.svelte';

	let {
		lines,
		viewBox,
		selectedStationId,
		onSelectStation
	}: {
		lines: RoleLine[];
		viewBox: { width: number; height: number };
		selectedStationId: string | null;
		onSelectStation: (line: RoleLine, station: Station) => void;
	} = $props();
</script>

<svg
	viewBox={`0 0 ${viewBox.width} ${viewBox.height}`}
	role="img"
	aria-label="Process map of every role and task"
	class="h-auto w-full rounded-2xl border border-map-grid bg-map-paper shadow-sm"
>
	{#each lines as line (line.id)}
		<TubeLinePath {line} />
	{/each}
	{#each lines as line (line.id)}
		{#each line.stations as station (station.id)}
			<MapStation
				{line}
				{station}
				isSelected={selectedStationId === station.id}
				onSelect={() => onSelectStation(line, station)}
			/>
		{/each}
	{/each}
</svg>
