<script lang="ts">
	import AnsweredGapsList from './AnsweredGapsList.svelte';
	import KnowledgeGapCard from './KnowledgeGapCard.svelte';
	import type { ChatbotSummary, KnowledgeGap } from '$lib/data/chatbotTypes';

	let {
		chatbot,
		openGaps,
		answeredGaps,
		teachingCredits
	}: {
		chatbot: ChatbotSummary;
		openGaps: KnowledgeGap[];
		answeredGaps: KnowledgeGap[];
		teachingCredits: number;
	} = $props();
</script>

<section class="flex flex-col gap-4 rounded-2xl border border-hairline bg-carriage p-5">
	<div class="flex flex-col gap-1">
		<h2 class="flex items-center gap-3 font-display text-lg font-medium">
			Unanswered questions
			{#if openGaps.length > 0}
				<span class="rounded-full border border-signal/50 px-2.5 py-0.5 font-mono text-xs text-signal">
					{openGaps.length}
				</span>
			{/if}
		</h2>
		<p class="text-sm text-chalk/60">
			Questions {chatbot.name} could not answer from the knowledge base. Answer one and it is read
			into the expertise brain like a document ({teachingCredits} credits from your balance), so
			the bot can answer it next time.
		</p>
	</div>
	{#if openGaps.length === 0}
		<p class="text-sm text-chalk/50">
			Nothing outstanding — every question so far had an answer in the knowledge base.
		</p>
	{:else}
		<ul class="flex flex-col gap-3">
			{#each openGaps as gap (gap.id)}
				<li><KnowledgeGapCard {gap} {teachingCredits} /></li>
			{/each}
		</ul>
	{/if}
	<AnsweredGapsList gaps={answeredGaps} />
</section>
