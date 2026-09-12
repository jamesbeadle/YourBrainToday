<script lang="ts">
	import AgentTypingIndicator from '../chat/AgentTypingIndicator.svelte';
	import ChatComposer from '../chat/ChatComposer.svelte';
	import OutOfCreditsNotice from '../workspace/OutOfCreditsNotice.svelte';
	import type { ChatMessage } from '$lib/data/chatTypes';

	let { brainId }: { brainId: string } = $props();

	let messages = $state<ChatMessage[]>([]);
	let isThinking = $state(false);
	let isOutOfCredits = $state(false);
	let threadElement = $state<HTMLElement | null>(null);

	function appendMessage(author: ChatMessage['author'], text: string) {
		messages.push({ id: messages.length, author, text });
	}

	async function sendQuestion(text: string) {
		appendMessage('user', text);
		isThinking = true;
		const response = await fetch('/api/knowledge-base/brain-ask', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ brainId, question: text })
		});
		isThinking = false;
		if (response.status === 402) {
			isOutOfCredits = true;
			return;
		}
		if (!response.ok) {
			appendMessage('agent', 'Something went wrong on my end — please try that again.');
			return;
		}
		const payload = await response.json();
		appendMessage('agent', payload.reply);
	}

	$effect(() => {
		void messages.length;
		void isThinking;
		threadElement?.scrollTo({ top: threadElement.scrollHeight, behavior: 'smooth' });
	});
</script>

<div class="flex min-h-0 flex-1 flex-col font-mono text-[13px] leading-relaxed">
	<div bind:this={threadElement} class="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4">
		{#if messages.length === 0}
			<p class="text-chalk/40">
				Query this brain — answers come only from what it actually holds.
			</p>
		{/if}
		{#each messages as message (message.id)}
			<div class={message.author === 'user' ? 'text-signal' : 'whitespace-pre-line text-chalk/80'}>
				{message.author === 'user' ? `> ${message.text}` : message.text}
			</div>
		{/each}
		{#if isThinking}
			<AgentTypingIndicator />
		{/if}
	</div>
	{#if isOutOfCredits}
		<OutOfCreditsNotice />
	{:else}
		<div class="border-t border-hairline p-3">
			<ChatComposer onSend={sendQuestion} isDisabled={isThinking} placeholder="Ask this brain…" />
		</div>
	{/if}
</div>
