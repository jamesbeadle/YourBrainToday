<script lang="ts">
	import ChatComposer from '../chat/ChatComposer.svelte';
	import ChatbotChatHeader from './ChatbotChatHeader.svelte';
	import ChatbotQuietState from './ChatbotQuietState.svelte';
	import ChatbotThread from './ChatbotThread.svelte';
	import { askChatbotEndpoint } from './chatbotAsk';
	import { freshLine, lineFromMessage, type ChatbotLine } from './chatbotLines';
	import { quietMessageFor } from './chatbotQuietMessage';
	import { questionFloorCreditsFor } from '$lib/data/creditPricing';
	import type { ChatbotMembership, ChatbotSpeaker, ChatbotSummary } from '$lib/data/chatbotTypes';
	import type { ChatbotConversation } from '$lib/server/chatbots/getChatbotConversation';

	let {
		chatbot,
		membership,
		conversation,
		ownerName
	}: {
		chatbot: ChatbotSummary;
		membership: ChatbotMembership;
		conversation: ChatbotConversation;
		ownerName: string;
	} = $props();

	const creditsPerQuestion = $derived(questionFloorCreditsFor(membership.modelId));

	let linesSinceLoad = $state<ChatbotLine[]>([]);
	const lines = $derived([...conversation.messages.map(lineFromMessage), ...linesSinceLoad]);

	let allowanceReported = $state<number | null>(null);
	const remaining = $derived(
		allowanceReported ?? membership.allowanceCredits - membership.spentCredits
	);

	let isThinking = $state(false);
	let refusal = $state<string | null>(null);
	const quietMessage = $derived(
		refusal ?? quietMessageFor(chatbot, remaining, creditsPerQuestion, ownerName)
	);

	function appendLine(speaker: ChatbotSpeaker, body: string) {
		linesSinceLoad.push(freshLine(speaker, body, linesSinceLoad.length));
	}

	async function sendQuestion(text: string) {
		appendLine('member', text);
		isThinking = true;
		const result = await askChatbotEndpoint(chatbot.id, text);
		isThinking = false;
		if (result.kind === 'answered') {
			allowanceReported = result.allowanceRemaining;
			appendLine('bot', result.answer.answerMarkdown);
			return;
		}
		if (result.kind === 'refused') {
			refusal = result.message;
			return;
		}
		appendLine('bot', result.message);
	}
</script>

<div class="mx-auto flex h-[calc(100dvh-3.5rem)] w-full max-w-3xl flex-col">
	<ChatbotChatHeader
		chatbotName={chatbot.name}
		modelId={membership.modelId}
		{creditsPerQuestion}
		{remaining}
		allowance={membership.allowanceCredits}
	/>
	<ChatbotThread {lines} {isThinking} chatbotName={chatbot.name} {creditsPerQuestion} />
	{#if quietMessage !== null}
		<ChatbotQuietState message={quietMessage} />
	{:else}
		<div class="border-t border-hairline p-3">
			<ChatComposer onSend={sendQuestion} isDisabled={isThinking} placeholder={`Ask ${chatbot.name}…`} />
		</div>
	{/if}
</div>
