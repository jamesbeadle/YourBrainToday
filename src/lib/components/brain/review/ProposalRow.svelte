<script lang="ts">
	import DiffView from './DiffView.svelte';
	import type { BrainChangeProposal } from '$lib/data/sharingTypes';

	let {
		proposal,
		isChecked,
		onToggle
	}: {
		proposal: BrainChangeProposal;
		isChecked: boolean;
		onToggle: () => void;
	} = $props();

	let isExpanded = $state(false);

	const isNew = $derived(proposal.before === null);
	const changeLabel = $derived(describeChange());
	const beforeBody = $derived(bodyOf(proposal.before));
	const afterBody = $derived(bodyOf(proposal.payload));

	function describeChange(): string {
		if (proposal.changeKind === 'context_write') return isNew ? 'New context' : 'Context update';
		return isNew ? 'New page' : 'Page update';
	}

	function bodyOf(record: Record<string, unknown> | null): string {
		if (record === null) return '';
		if (typeof record.body === 'string') return record.body;
		return JSON.stringify(record, null, 2);
	}
</script>

<li class="flex flex-col gap-2 border-b border-hairline py-2.5 last:border-b-0">
	<div class="flex items-center gap-2.5">
		<input
			type="checkbox"
			checked={isChecked}
			onchange={onToggle}
			aria-label={`Select ${proposal.title}`}
			class="h-4 w-4 shrink-0 accent-[var(--color-signal)]"
		/>
		<button
			type="button"
			onclick={() => (isExpanded = !isExpanded)}
			class="flex min-w-0 flex-1 items-baseline justify-between gap-2 text-left"
		>
			<span class="truncate text-sm text-chalk">{proposal.title}</span>
			<span
				class={`shrink-0 font-display text-[10px] tracking-wide uppercase ${
					isNew ? 'text-go/80' : 'text-caution/80'
				}`}
			>
				{changeLabel}
			</span>
		</button>
	</div>
	{#if isExpanded}
		<DiffView beforeText={beforeBody} afterText={afterBody} />
	{/if}
</li>
