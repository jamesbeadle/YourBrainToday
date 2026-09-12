<script lang="ts">
	import AgentTypingIndicator from '../chat/AgentTypingIndicator.svelte';
	import ChatbotMessageBubble from './ChatbotMessageBubble.svelte';
	import type { ChatbotLine } from './chatbotLines';

	let {
		lines,
		isThinking,
		chatbotName,
		creditsPerQuestion
	}: {
		lines: ChatbotLine[];
		isThinking: boolean;
		chatbotName: string;
		creditsPerQuestion: number;
	} = $props();

	let threadElement = $state<HTMLElement | null>(null);

	$effect(() => {
		void lines.length;
		void isThinking;
		threadElement?.scrollTo({ top: threadElement.scrollHeight, behavior: 'smooth' });
	});
</script>

<div bind:this={threadElement} class="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
	{#if lines.length === 0}
		<p class="text-sm text-chalk/40">
			Ask {chatbotName} anything its knowledge base might know — what things mean, what has
			happened, or who does what next. Each question uses at least {creditsPerQuestion} credits
			of your allowance — longer answers a little more.
		</p>
	{/if}
	{#each lines as line (line.id)}
		<ChatbotMessageBubble speaker={line.speaker} body={line.body} />
	{/each}
	{#if isThinking}
		<AgentTypingIndicator />
	{/if}
</div>
