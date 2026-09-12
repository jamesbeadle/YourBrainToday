<script lang="ts">
	import { formatElapsedSeconds, ingestStageAt } from './ingestStages';
	import { onMount } from 'svelte';

	const elapsedDisplayThresholdSeconds = 5;

	let elapsedSeconds = $state(0);

	onMount(() => {
		const startedAt = Date.now();
		const ticker = setInterval(() => {
			elapsedSeconds = Math.floor((Date.now() - startedAt) / 1000);
		}, 1000);
		return () => clearInterval(ticker);
	});
</script>

{ingestStageAt(elapsedSeconds)}…{#if elapsedSeconds >= elapsedDisplayThresholdSeconds}
	· {formatElapsedSeconds(elapsedSeconds)}{/if}
