<script lang="ts">
	let { size = 36 }: { size?: number } = $props();

	const letterSize = $derived(size * 0.55);
	const cornerRadius = $derived(size * 0.25);
</script>

<span
	class="flex shrink-0 items-center justify-center bg-carriage font-display font-bold text-chalk"
	style="width: {size}px; height: {size}px; border-radius: {cornerRadius}px; font-size: {letterSize}px;"
	aria-label="Your Brain Today"
>
	Y<span class="text-signal">.</span>
</span>
