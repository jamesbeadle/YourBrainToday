<script lang="ts">
	import { formatElapsedSeconds } from './elapsedTime';
	import { onMount } from 'svelte';

	let { stage }: { stage: string } = $props();

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

{stage}…{#if elapsedSeconds >= elapsedDisplayThresholdSeconds}
	· {formatElapsedSeconds(elapsedSeconds)}{/if}
