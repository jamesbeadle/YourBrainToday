<script lang="ts">
	export type Chip = { key: string; label: string; accent?: string };

	let {
		label,
		chips,
		chosenKeys,
		onToggle
	}: { label: string; chips: Chip[]; chosenKeys: string[]; onToggle: (key: string) => void } =
		$props();

	function isChosen(chip: Chip): boolean {
		return chosenKeys.includes(chip.key);
	}
</script>

<div class="flex flex-wrap items-center gap-1.5" role="group" aria-label={label}>
	<span class="mr-1 font-mono text-[10px] tracking-widest text-chalk/40 uppercase">{label}</span>
	{#each chips as chip (chip.key)}
		<button
			type="button"
			aria-pressed={isChosen(chip)}
			onclick={() => onToggle(chip.key)}
			class={[
				'flex items-center gap-1.5 rounded-full border px-3 py-1 font-display text-xs transition',
				isChosen(chip)
					? 'border-chalk/40 bg-hairline/50 text-chalk'
					: 'border-hairline text-chalk/60 hover:border-chalk/30 hover:text-chalk'
			]}
		>
			{#if chip.accent !== undefined}
				<span class="h-1.5 w-1.5 rounded-full" style:background-color={chip.accent}></span>
			{/if}
			{chip.label}
		</button>
	{/each}
</div>
