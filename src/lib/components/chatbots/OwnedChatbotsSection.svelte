<script lang="ts">
	import ChatbotCard from './ChatbotCard.svelte';
	import { knowledgeBaseHref, knowledgeBaseToolHref } from '$lib/data/knowledge/knowledgeBaseRoutes';
	import type { OwnedChatbotGroup } from '$lib/server/chatbots/getChatbotsForOwner';

	let { groups }: { groups: OwnedChatbotGroup[] } = $props();
</script>

<section class="flex flex-col gap-4">
	<h2 class="font-display text-xs tracking-widest text-chalk/50 uppercase">Chatbots you run</h2>
	{#each groups as group (group.knowledgeBaseId)}
		<div class="flex flex-col gap-3 rounded-2xl border border-hairline p-5">
			<div class="flex flex-wrap items-center justify-between gap-3">
				<a
					href={knowledgeBaseHref(group.knowledgeBaseId)}
					class="font-display text-base text-chalk transition hover:text-signal"
				>
					{group.knowledgeBaseName}
				</a>
				<a
					href={knowledgeBaseToolHref(group.knowledgeBaseId, 'chatbots')}
					class="rounded-full border border-signal px-4 py-1.5 font-display text-xs text-signal
						transition hover:bg-signal hover:text-night"
				>
					New chatbot
				</a>
			</div>
			{#if group.chatbots.length === 0}
				<p class="text-xs text-chalk/40">No chatbots on this knowledge base yet.</p>
			{:else}
				<ul class="grid gap-3 md:grid-cols-2">
					{#each group.chatbots as chatbot (chatbot.id)}
						<li><ChatbotCard {chatbot} /></li>
					{/each}
				</ul>
			{/if}
		</div>
	{/each}
</section>
