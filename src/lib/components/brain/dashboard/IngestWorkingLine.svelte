<script lang="ts">
	import IngestProgressLabel from '../IngestProgressLabel.svelte';

	let { sourceName }: { sourceName: string } = $props();
</script>

<p class="animate-pulse text-chalk/60">
	⇡ {sourceName} — <IngestProgressLabel />
</p>
