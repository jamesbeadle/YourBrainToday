<script lang="ts">
	let { remaining, allowance }: { remaining: number; allowance: number } = $props();

	const isLow = $derived(allowance > 0 && remaining <= allowance / 5);
</script>

<span
	class={`rounded-full border px-3 py-1 font-mono text-xs ${
		isLow ? 'border-caution/50 text-caution' : 'border-hairline text-chalk/70'
	}`}
>
	{remaining} of {allowance} credits left
</span>
