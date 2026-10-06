<script lang="ts">
	import type { BrainSourceArrival } from '$lib/data/brainSourceTypes';

	let { arrivedThrough }: { arrivedThrough: BrainSourceArrival } = $props();

	const arrivalLabels: Record<BrainSourceArrival, string | null> = {
		upload: null,
		mcp: 'Sent over MCP',
		api: 'Sent through the API'
	};

	const arrivalLabel = $derived(arrivalLabels[arrivedThrough]);
</script>

{#if arrivalLabel !== null}
	<p class="font-mono text-[10px] tracking-widest text-chalk/40 uppercase">{arrivalLabel}</p>
{/if}
