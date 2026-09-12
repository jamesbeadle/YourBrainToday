<script lang="ts">
	let { message }: { message: string | null } = $props();
</script>

{#if message !== null}
	<p
		role="alert"
		class="rounded-xl border border-caution/50 bg-caution/10 px-4 py-3 text-sm text-caution"
	>
		{message}
	</p>
{/if}
