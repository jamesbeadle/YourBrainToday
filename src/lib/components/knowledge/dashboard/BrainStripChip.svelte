<script lang="ts">
	import { knowledgeBaseHref } from '$lib/data/knowledge/knowledgeBaseRoutes';
	import type { ConstellationSlot } from '../constellationSlots';

	let {
		knowledgeBaseId,
		slot,
		isActive,
		onIntend,
		onSelect
	}: {
		knowledgeBaseId: string;
		slot: ConstellationSlot;
		isActive: boolean;
		onIntend: (slot: ConstellationSlot | null) => void;
		onSelect: (slot: ConstellationSlot) => void;
	} = $props();

	const isGhost = $derived(slot.variant === 'ghost');
	const href = $derived(isActive ? knowledgeBaseHref(knowledgeBaseId) : slot.href);
	const label = $derived(isGhost ? `+ ${slot.kindLabel}` : slot.kindLabel);

	/** A ghost links to the new brain form and the open brain's chip links back out; the rest fly in. */
	function select(event: MouseEvent): void {
		if (isGhost || isActive) return;
		event.preventDefault();
		onSelect(slot);
	}
</script>

<a
	{href}
	aria-current={isActive ? 'page' : undefined}
	aria-label={isActive ? `${slot.name} — back to the knowledge base` : slot.name}
	title={slot.name}
	onclick={select}
	onpointerenter={() => onIntend(isActive ? null : slot)}
	onpointerleave={() => onIntend(null)}
	style={`color: ${slot.accent}`}
	class={[
		'pointer-events-auto flex min-h-11 items-center gap-2 rounded-full border px-4',
		'font-display text-xs transition lg:min-h-0 lg:px-3 lg:py-1.5',
		isActive ? 'border-current bg-carriage' : 'border-hairline bg-night/80 hover:border-current',
		isGhost && 'border-dashed opacity-60 hover:opacity-100'
	]}
>
	<span aria-hidden="true" class="h-2 w-2 shrink-0 rounded-full bg-current"></span>
	<span class="whitespace-nowrap">{label}</span>
</a>
