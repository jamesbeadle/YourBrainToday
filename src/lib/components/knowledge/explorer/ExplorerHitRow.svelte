<script lang="ts">
	import type { KnowledgeSearchHit } from './searchKnowledgeHits';

	let { hit }: { hit: KnowledgeSearchHit } = $props();
</script>

<li>
	<a
		href={hit.href}
		class="flex flex-col gap-1 rounded-xl border border-transparent px-3 py-2.5 transition
			hover:border-hairline hover:bg-carriage/60"
	>
		<div class="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
			<span class="font-display text-sm font-medium text-chalk">{hit.title}</span>
			<span class="font-mono text-[10px] tracking-widest text-signal uppercase">{hit.kindLabel}</span>
			<span class="font-display text-xs text-chalk/50">{hit.brainName}</span>
		</div>
		{#if hit.snippet !== ''}
			<p class="text-sm text-chalk/60">{hit.snippet}</p>
		{/if}
	</a>
</li>
