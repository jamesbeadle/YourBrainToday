<script lang="ts">
	import BrainGlyph from './BrainGlyph.svelte';
	import { findKnowledgeKind } from '$lib/data/knowledge/knowledgeKinds';
	import type { RegisterBrain } from '$lib/server/knowledge/getSecondBrainRegister';

	let { brain, groupName }: { brain: RegisterBrain; groupName: string } = $props();

	const kind = $derived(findKnowledgeKind(brain.kind));
	const updatedOn = $derived(
		new Date(brain.updatedAt).toLocaleDateString('en-GB', {
			day: '2-digit',
			month: 'short',
			year: 'numeric'
		})
	);
	const showsEntity = $derived(brain.entityName !== '' && brain.entityName !== groupName);
</script>

<li>
	<a
		href={brain.href}
		class="grid grid-cols-[auto_1fr_auto] items-center gap-4 px-5 py-3 transition
			hover:bg-carriage/70 sm:grid-cols-[auto_1fr_7rem_7.5rem]"
	>
		<span class="flex h-9 w-9 items-center justify-center">
			<BrainGlyph seed={brain.id} accent={kind.accent} size={32} />
		</span>
		<span class="flex min-w-0 flex-col">
			<span class="truncate font-display text-sm font-medium text-chalk">{brain.name}</span>
			{#if showsEntity}
				<span class="truncate text-xs text-chalk/40">{brain.entityName}</span>
			{/if}
		</span>
		<span
			class="justify-self-start rounded-full px-2.5 py-0.5 text-center font-display text-[11px]
				sm:w-24 sm:justify-self-auto"
			style={`background-color: ${kind.accent}1a; color: ${kind.accent}`}
		>
			{kind.label}
		</span>
		<span class="hidden text-right text-xs text-chalk/35 tabular-nums sm:block">{updatedOn}</span>
	</a>
</li>
