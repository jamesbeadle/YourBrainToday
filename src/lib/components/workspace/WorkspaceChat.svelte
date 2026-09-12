<script lang="ts">
	import AgentTypingIndicator from '../chat/AgentTypingIndicator.svelte';
	import ChatComposer from '../chat/ChatComposer.svelte';
	import ChatMessageBubble from '../chat/ChatMessageBubble.svelte';
	import OutOfCreditsNotice from './OutOfCreditsNotice.svelte';
	import { invalidateAll } from '$app/navigation';
	import { openingQuestion } from '$lib/data/scriptedAgent';
	import type { ChatMessage } from '$lib/data/chatTypes';
	import type { WorkflowModel } from '$lib/data/workflowModel';

	let {
		workflowId,
		initialMessages,
		onMapUpdate,
		frame = 'card'
	}: {
		workflowId: string;
		initialMessages: ChatMessage[];
		onMapUpdate: (model: WorkflowModel) => void;
		frame?: 'card' | 'panel';
	} = $props();

	const frameClasses = $derived(
		frame === 'card'
			? 'flex h-[32rem] flex-col overflow-hidden rounded-2xl border border-hairline bg-carriage'
			: 'flex min-h-0 flex-1 flex-col overflow-hidden bg-night'
	);

	const sessionId = crypto.randomUUID();
	let messages = $derived(seedMessages(initialMessages));
	let isAgentTyping = $state(false);
	let isOutOfCredits = $state(false);
	let threadElement = $state<HTMLElement | null>(null);

	function seedMessages(history: ChatMessage[]): ChatMessage[] {
		if (history.length > 0) return [...history];
		return [{ id: 0, author: 'agent', text: openingQuestion }];
	}

	function appendMessage(author: ChatMessage['author'], text: string) {
		messages = [...messages, { id: messages.length, author, text }];
	}

	async function sendUserMessage(text: string) {
		appendMessage('user', text);
		isAgentTyping = true;
		const response = await fetch('/api/agent-chat', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ sessionId, workflowId, message: text })
		});
		isAgentTyping = false;
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
		onMapUpdate(payload.map);
		await invalidateAll();
	}

	$effect(() => {
		void messages.length;
		void isAgentTyping;
		threadElement?.scrollTo({ top: threadElement.scrollHeight, behavior: 'smooth' });
	});
</script>

<section class={frameClasses}>
	<div bind:this={threadElement} class="flex flex-1 flex-col gap-3 overflow-y-auto p-5 text-sm">
		{#each messages as message (message.id)}
			<ChatMessageBubble {message} />
		{/each}
		{#if isAgentTyping}
			<AgentTypingIndicator />
		{/if}
	</div>
	{#if isOutOfCredits}
		<OutOfCreditsNotice />
	{:else}
		<div class="border-t border-hairline p-4">
			<ChatComposer onSend={sendUserMessage} isDisabled={isAgentTyping} />
		</div>
	{/if}
</section>
