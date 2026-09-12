<script lang="ts">
	import type { RoleLine, Station } from '$lib/data/types';
	import { labelBaseline, labelLineHeight, stationLabelLines } from './stationLabel';

	let {
		line,
		station,
		isSelected,
		onSelect
	}: { line: RoleLine; station: Station; isSelected: boolean; onSelect: () => void } = $props();

	const x = $derived(station.position.x);
	const y = $derived(station.position.y);
	const labelLines = $derived(stationLabelLines(station.name));
	const labelX = $derived(x + station.labelOffset.x);
	const firstLineBaseline = $derived(labelBaseline(y, station.labelOffset.y, labelLines.length));

	function selectOnEnter(event: KeyboardEvent) {
		if (event.key !== 'Enter') return;
		onSelect();
	}
</script>

<g
	role="button"
	tabindex="0"
	aria-label={`${station.name} station on the ${line.role} line`}
	class="cursor-pointer outline-none"
	onclick={onSelect}
	onkeydown={selectOnEnter}
>
	{#if station.producesOutput}
		<circle cx={x} cy={y} r="16" fill="var(--color-tube-circle)" />
		<circle
			cx={x}
			cy={y}
			r="9"
			fill="var(--color-map-paper)"
			stroke="var(--color-map-ink)"
			stroke-width="4"
		/>
	{:else if station.isInterchange}
		<circle
			cx={x}
			cy={y}
			r="10"
			fill="var(--color-map-paper)"
			stroke="var(--color-map-ink)"
			stroke-width="4"
		/>
	{:else}
		<rect
			x={x - 2.5}
			y={y + 4}
			width="5"
			height="13"
			fill={line.colour}
			transform={`rotate(${station.tickAngle} ${x} ${y})`}
		/>
	{/if}
	{#if isSelected}
		<circle
			cx={x}
			cy={y}
			r="17"
			fill="none"
			stroke={line.colour}
			stroke-width="2.5"
			stroke-dasharray="5 4"
		/>
	{/if}
	<text
		text-anchor={station.labelAnchor}
		font-size="12"
		fill="var(--color-map-ink)"
		class="font-display select-none"
	>
		{#each labelLines as labelLine, lineIndex}
			<tspan x={labelX} y={firstLineBaseline + lineIndex * labelLineHeight}>{labelLine}</tspan>
		{/each}
	</text>
</g>
