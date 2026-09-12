<script lang="ts">
	import { knowledgeBaseHref } from '$lib/data/knowledge/knowledgeBaseRoutes';
	import type { ConstellationSlot } from '../constellationSlots';
	import type { KnowledgeBase } from '$lib/server/knowledge/getKnowledgeBase';

	let {
		knowledgeBase,
		slot,
		isOpening
	}: {
		knowledgeBase: KnowledgeBase;
		slot: ConstellationSlot;
		isOpening: boolean;
	} = $props();
</script>

<nav
	aria-label="Where you are"
	class="pointer-events-auto flex min-w-0 flex-1 items-center gap-2 font-display"
>
	<a
		href={knowledgeBaseHref(knowledgeBase.id)}
		title={knowledgeBase.name}
		class="flex min-w-0 shrink items-center gap-1.5 text-sm text-chalk/60 transition hover:text-chalk"
	>
		<span aria-hidden="true">←</span>
		<span class="truncate">{knowledgeBase.name}</span>
	</a>
	<span aria-hidden="true" class="shrink-0 text-chalk/30">›</span>
	{#if isOpening}
		<p role="status" class="animate-pulse truncate text-sm text-chalk/60">
			Opening {slot.kindLabel}…
		</p>
	{:else}
		<div class="flex min-w-0 flex-1 flex-col gap-0.5">
			<h1 class="truncate text-sm font-medium text-chalk lg:text-base">{slot.name}</h1>
			<p class="truncate text-[10px] tracking-widest uppercase" style:color={slot.accent}>
				{slot.kindLabel} brain
			</p>
		</div>
	{/if}
</nav>
