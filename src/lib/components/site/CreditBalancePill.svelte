<script lang="ts">
	let {
		balance,
		isUnitHiddenOnNarrowScreens = false
	}: { balance: number; isUnitHiddenOnNarrowScreens?: boolean } = $props();

	const unit = $derived(balance === 1 ? 'credit' : 'credits');
</script>

<a
	href="/account"
	class="flex items-center gap-2 rounded-full border border-hairline bg-carriage px-4 py-1.5
		font-display text-sm whitespace-nowrap transition hover:border-go/60"
	title="Your credit balance"
>
	<span class="h-2 w-2 rounded-full bg-go"></span>
	{balance}
	<span class={[isUnitHiddenOnNarrowScreens && 'hidden lg:inline']}>{unit}</span>
</a>
