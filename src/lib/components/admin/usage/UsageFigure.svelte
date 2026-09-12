<script lang="ts">
	let {
		label,
		value,
		detail = '',
		tone = ''
	}: { label: string; value: string; detail?: string; tone?: string } = $props();
</script>

<div class="flex flex-col gap-1 bg-night px-5 py-4">
	<dt class="font-display text-xs tracking-widest text-chalk/50 uppercase">{label}</dt>
	<dd class="font-display text-2xl tabular-nums {tone}">{value}</dd>
	{#if detail !== ''}
		<dd class="text-xs text-chalk/50 tabular-nums">{detail}</dd>
	{/if}
</div>
