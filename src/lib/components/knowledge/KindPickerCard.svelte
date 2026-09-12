<script lang="ts">
	import type { KnowledgeKindDefinition } from '$lib/data/knowledge/knowledgeKinds';

	let {
		kind,
		isSelected,
		onSelect
	}: { kind: KnowledgeKindDefinition; isSelected: boolean; onSelect: () => void } = $props();
</script>

<button
	type="button"
	onclick={onSelect}
	class="flex flex-col gap-1.5 rounded-2xl border p-4 text-left transition
		{isSelected ? 'bg-carriage' : 'border-hairline bg-carriage/50 hover:border-chalk/30'}"
	style={isSelected ? `border-color: ${kind.accent}` : `border-top: 3px solid ${kind.accent}44`}
>
	<span class="flex items-center gap-2">
		<span
			class="rounded-full border px-2 py-0.5 text-xs"
			style={`border-color: ${kind.accent}66; color: ${kind.accent}`}
		>
			{kind.label}
		</span>
	</span>
	<span class="font-display text-lg font-medium">{kind.question}</span>
	<span class="text-sm text-chalk/60">{kind.explainer}</span>
</button>
