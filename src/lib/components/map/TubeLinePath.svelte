<script lang="ts">
	import type { Point, RoleLine } from '$lib/data/types';

	let { line }: { line: RoleLine } = $props();

	function toPolylinePoints(route: Point[]): string {
		return route.map((point) => `${point.x},${point.y}`).join(' ');
	}
</script>

{#each line.routes as route}
	<polyline
		points={toPolylinePoints(route)}
		fill="none"
		stroke={line.colour}
		stroke-width="10"
		stroke-linecap="round"
		stroke-linejoin="round"
	/>
{/each}
