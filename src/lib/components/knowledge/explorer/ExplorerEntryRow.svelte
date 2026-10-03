<script lang="ts">
	import { findKnowledgeKind } from '$lib/data/knowledge/knowledgeKinds';
	import type { KnowledgeIndexEntry } from '$lib/data/knowledge/knowledgeIndex';

	let { entry }: { entry: KnowledgeIndexEntry } = $props();

	const accent = $derived(findKnowledgeKind(entry.kind).accent);
	const dateLabel = $derived(
		entry.date === null
			? ''
			: new Date(entry.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
	);
</script>

<li>
	<a
		href={entry.href}
		class="flex flex-col gap-1 rounded-xl border border-transparent px-3 py-2.5 transition
			hover:border-hairline hover:bg-carriage/60"
	>
		<div class="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
			<span class="font-display text-sm font-medium text-chalk">{entry.title}</span>
			<span class="font-mono text-[10px] tracking-widest uppercase" style:color={accent}>
				{entry.kindLabel}
			</span>
			<span class="font-display text-xs text-chalk/50">{entry.brainName}</span>
			{#if entry.detail !== ''}
				<span class="font-display text-xs text-chalk/40">· {entry.detail}</span>
			{/if}
			{#if dateLabel !== ''}
				<span class="ml-auto font-display text-xs text-chalk/40">{dateLabel}</span>
			{/if}
		</div>
		{#if entry.summary !== ''}
			<p class="line-clamp-2 text-sm text-chalk/60">{entry.summary}</p>
		{/if}
	</a>
</li>
