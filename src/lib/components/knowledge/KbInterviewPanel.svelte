<script lang="ts">
	import AgentTypingIndicator from '../chat/AgentTypingIndicator.svelte';
	import ChatComposer from '../chat/ChatComposer.svelte';
	import ChatMessageBubble from '../chat/ChatMessageBubble.svelte';
	import OutOfCreditsNotice from '../workspace/OutOfCreditsNotice.svelte';
	import {
		defaultInterviewIntro,
		fetchInterviewReply,
		interviewOpeningLine,
		type InterviewKind
	} from './interviewRequest';
	import type { ChatMessage } from '$lib/data/chatTypes';

	let {
		knowledgeBaseId,
		focusKind = null,
		intro = defaultInterviewIntro
	}: { knowledgeBaseId: string; focusKind?: InterviewKind; intro?: string } = $props();

	let messages = $state<ChatMessage[]>([]);
	let isAgentTyping = $state(false);
	let isOutOfCredits = $state(false);
	let hasStarted = $state(false);
	let threadElement = $state<HTMLElement | null>(null);

	function appendMessage(author: ChatMessage['author'], text: string) {
		messages.push({ id: messages.length, author, text });
	}

	async function startInterview() {
		hasStarted = true;
		await requestNextQuestion();
	}

	async function sendAnswer(text: string) {
		appendMessage('user', text);
		await requestNextQuestion();
	}

	async function requestNextQuestion() {
		isAgentTyping = true;
		const conversation = [
			{ author: 'user', text: interviewOpeningLine },
			...messages.map((message) => ({ author: message.author, text: message.text }))
		];
		const result = await fetchInterviewReply(knowledgeBaseId, focusKind, conversation);
		isAgentTyping = false;
		if (result.status === 'out_of_credits') {
			isOutOfCredits = true;
			return;
		}
		if (result.status === 'error') {
			appendMessage('agent', 'Something went wrong on my end — please try that again.');
			return;
		}
		appendMessage('agent', result.reply);
	}

	$effect(() => {
		void messages.length;
		void isAgentTyping;
		threadElement?.scrollTo({ top: threadElement.scrollHeight, behavior: 'smooth' });
	});
</script>

{#if !hasStarted}
	<div class="flex flex-col items-start gap-3">
		<p class="text-sm text-chalk/60">{intro}</p>
		<button
			type="button"
			onclick={startInterview}
			class="rounded-full bg-signal px-6 py-2.5 font-display text-sm font-medium text-night
				transition hover:brightness-110"
		>
			Start the interview
		</button>
	</div>
{:else}
	<div class="flex h-96 flex-col overflow-hidden rounded-xl border border-hairline bg-night">
		<div bind:this={threadElement} class="flex flex-1 flex-col gap-3 overflow-y-auto p-4 text-sm">
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
			<div class="border-t border-hairline p-3">
				<ChatComposer
					onSend={sendAnswer}
					isDisabled={isAgentTyping}
					placeholder="Answer in your own words…"
				/>
			</div>
		{/if}
	</div>
{/if}
