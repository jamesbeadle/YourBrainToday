<script lang="ts">
	import { buildGlyphLayout } from './glyphLayout';
	import { categoryAccents } from '$lib/data/knowledge/brainTypeCatalog';
	import type { BrainCategory } from '$lib/data/knowledge/knowledgeTypes';

	let {
		seed,
		category = 'domain',
		size = 72,
		accent = null
	}: { seed: string; category?: BrainCategory; size?: number; accent?: string | null } = $props();

	const glyphAccent = $derived(accent ?? categoryAccents[category]);
	const layout = $derived(buildGlyphLayout(seed));
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 100 100"
	role="img"
	aria-label="Brain constellation"
	class="shrink-0"
>
	<ellipse cx="50" cy="46" rx="44" ry="36" fill={glyphAccent} opacity="0.06" />
	{#each layout.edges as edge}
		<line
			x1={edge.from.x}
			y1={edge.from.y}
			x2={edge.to.x}
			y2={edge.to.y}
			stroke={glyphAccent}
			stroke-width="0.8"
			opacity="0.45"
		/>
	{/each}
	{#each layout.nodes as node}
		<circle cx={node.x} cy={node.y} r={node.radius * 2.2} fill={glyphAccent} opacity="0.15" />
		<circle cx={node.x} cy={node.y} r={node.radius} fill={glyphAccent} opacity="0.9" />
	{/each}
</svg>
