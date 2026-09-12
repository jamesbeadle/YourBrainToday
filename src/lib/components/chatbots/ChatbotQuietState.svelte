<script lang="ts">
	let { message }: { message: string } = $props();
</script>

<div class="border-t border-hairline bg-night p-4">
	<p class="text-sm text-chalk/70">{message}</p>
</div>
