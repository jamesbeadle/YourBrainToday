<script lang="ts">
	import {
		allKnowledgeBasesHref,
		knowledgeBaseHref,
		newKnowledgeBaseHref
	} from '$lib/data/knowledge/knowledgeBaseRoutes';
	import type { KnowledgeBaseSummary } from '$lib/data/knowledge/knowledgeTypes';

	let {
		knowledgeBases,
		currentKnowledgeBaseId,
		onClose
	}: {
		knowledgeBases: KnowledgeBaseSummary[];
		currentKnowledgeBaseId: string;
		onClose: () => void;
	} = $props();

	const menuLinkClass = `block rounded-lg px-3 py-2 font-display text-sm text-chalk/80 transition
		hover:bg-night/60 hover:text-chalk`;

	function brainCountLabel(knowledgeBase: KnowledgeBaseSummary): string {
		const count = knowledgeBase.domainBrainCount + knowledgeBase.instanceBrainCount;
		return count === 1 ? '1 brain' : `${count} brains`;
	}
</script>

<button
	type="button"
	aria-label="Close knowledge base menu"
	class="fixed inset-0 z-40 cursor-default"
	onclick={onClose}
></button>
<nav
	aria-label="Knowledge base menu"
	class="absolute top-full left-0 z-50 mt-2 w-72 rounded-2xl border border-hairline bg-carriage p-2
		shadow-2xl"
>
	<ul class="max-h-72 overflow-y-auto">
		{#each knowledgeBases as knowledgeBase (knowledgeBase.id)}
			<li>
				<a
					href={knowledgeBaseHref(knowledgeBase.id)}
					aria-current={knowledgeBase.id === currentKnowledgeBaseId ? 'page' : undefined}
					onclick={onClose}
					class={`${menuLinkClass} flex items-baseline justify-between gap-3 aria-[current=page]:text-signal`}
				>
					<span class="truncate">{knowledgeBase.name}</span>
					<span class="shrink-0 text-xs text-chalk/40">{brainCountLabel(knowledgeBase)}</span>
				</a>
			</li>
		{/each}
	</ul>
	<div class="my-2 border-t border-hairline"></div>
	<a href={newKnowledgeBaseHref} onclick={onClose} class={menuLinkClass}>New knowledge base</a>
	<a href={allKnowledgeBasesHref} onclick={onClose} class={menuLinkClass}>All knowledge bases</a>
</nav>
