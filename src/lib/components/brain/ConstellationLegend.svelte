<script lang="ts">
	import { asCssColour, kindColours } from './constellation/constellationPalette';
	import { domainBlockLabels, domainBlockOrder } from '$lib/data/domainBlocks';

	const legendKinds = domainBlockOrder.filter((kind) => kind !== 'context_map');

	let isOpen = $state(false);
</script>

<div class="pointer-events-auto hidden flex-col items-start gap-2 sm:flex">
	<button
		type="button"
		onclick={() => (isOpen = !isOpen)}
		aria-expanded={isOpen}
		class="rounded-full border border-hairline bg-night/70 px-3 py-1 font-display text-xs
			text-chalk/60 backdrop-blur transition hover:border-chalk/40 hover:text-chalk"
	>
		{isOpen ? 'Key ✕' : 'Key'}
	</button>
	{#if isOpen}
		<ul class="flex flex-col gap-1 rounded-xl border border-hairline bg-night/70 p-3 backdrop-blur">
			{#each legendKinds as kind (kind)}
				<li class="flex items-center gap-2 text-xs text-chalk/70">
					<span
						class="h-2 w-2 rounded-full"
						style={`background-color: ${asCssColour(kindColours[kind])}`}
					></span>
					{domainBlockLabels[kind].singular}
				</li>
			{/each}
		</ul>
	{/if}
</div>
