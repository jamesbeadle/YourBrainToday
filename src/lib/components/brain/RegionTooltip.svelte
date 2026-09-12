<script lang="ts">
	import type { BrainRegion, RegionHover } from './regions/regionTypes';

	let { hover, region }: { hover: RegionHover; region: BrainRegion } = $props();
</script>

<div
	class="pointer-events-none absolute z-10 max-w-64 -translate-y-full rounded-lg border
		border-hairline bg-night/85 px-3 py-2 backdrop-blur"
	style={`left: ${hover.x + 14}px; top: ${hover.y - 10}px`}
>
	<p class="font-display text-sm text-chalk">{region.name}</p>
	<p class="text-xs text-chalk/50">{region.caption}</p>
</div>
