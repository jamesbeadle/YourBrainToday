<script lang="ts">
	let { fontSize = 20 }: { fontSize?: number } = $props();
</script>

<span
	class="font-display font-bold tracking-tight text-chalk"
	style="font-size: {fontSize}px; line-height: 1;"
	aria-label="Your Brain Today"
>
	YBT<span class="text-signal">.</span>
</span>
