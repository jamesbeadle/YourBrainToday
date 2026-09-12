<script lang="ts">
	import BrainStripChip from './BrainStripChip.svelte';
	import type { ConstellationSlot } from '../constellationSlots';

	let {
		knowledgeBaseId,
		slots,
		activeSlotId,
		hint,
		onIntend,
		onSelect
	}: {
		knowledgeBaseId: string;
		slots: ConstellationSlot[];
		activeSlotId: string | null;
		hint: string | null;
		onIntend: (slot: ConstellationSlot | null) => void;
		onSelect: (slot: ConstellationSlot) => void;
	} = $props();
</script>

<div
	class="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex flex-col items-center gap-2
		px-4 pb-3"
>
	<nav aria-label="Brains" class="flex flex-wrap items-center justify-center gap-2">
		{#each slots as slot (slot.id)}
			<BrainStripChip
				{knowledgeBaseId}
				{slot}
				isActive={slot.id === activeSlotId}
				{onIntend}
				{onSelect}
			/>
		{/each}
	</nav>
	{#if hint !== null}
		<p
			class="hidden font-display text-[10px] tracking-widest whitespace-nowrap text-chalk/25
				uppercase lg:block"
		>
			{hint}
		</p>
	{/if}
</div>
