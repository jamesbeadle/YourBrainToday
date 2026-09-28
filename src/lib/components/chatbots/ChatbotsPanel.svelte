<script lang="ts">
	import ChatbotCard from './ChatbotCard.svelte';
	import NewChatbotForm from './NewChatbotForm.svelte';
	import { knowledgeReadingCaps } from '$lib/data/knowledge/knowledgeReadingCaps';
	import type { ChatbotSummary } from '$lib/data/chatbotTypes';

	let {
		knowledgeBaseId,
		chatbots
	}: { knowledgeBaseId: string; chatbots: ChatbotSummary[] } = $props();
</script>

<div class="flex flex-col gap-4">
	<p class="text-sm text-chalk/60">
		A chatbot lets people ask this knowledge base without opening it. You fund it from your
		credits and decide how much each member may spend.
	</p>
	<p class="text-xs leading-relaxed text-chalk/50">
		Every bot reads all four brains as they stand at each question: the expertise model page
		by page (the first {knowledgeReadingCaps.longestExpertiseIndex.toLocaleString('en-GB')} characters
		of its index), the {knowledgeReadingCaps.mostExperienceItems} most recent experience entries, the
		process map — its roles, tasks and journeys — and the people around the business with how
		well they get on.
	</p>
	<NewChatbotForm {knowledgeBaseId} />
	{#if chatbots.length === 0}
		<p class="text-xs text-chalk/40">No chatbots yet — name one above to get started.</p>
	{:else}
		<ul class="flex flex-col gap-3">
			{#each chatbots as chatbot (chatbot.id)}
				<li><ChatbotCard {chatbot} /></li>
			{/each}
		</ul>
	{/if}
</div>
