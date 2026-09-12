<script lang="ts">
	import ChatbotChat from '$lib/components/chatbots/ChatbotChat.svelte';
	import { unnamedChatbotOwner } from '$lib/data/chatbotQuietMessages';

	let { data } = $props();
</script>

<svelte:head>
	<title>{data.chatbot?.name ?? 'Chatbot'} — Your Brain Today</title>
</svelte:head>

{#if data.chatbot === null || data.membership === null || data.conversation === null}
	<div class="mx-auto flex max-w-xl flex-col items-center gap-3 px-6 py-24 text-center">
		<h1 class="font-display text-2xl font-medium">You're not a member of this bot</h1>
		<p class="text-sm text-chalk/60">
			Its owner adds members by email. If you were invited, sign in with the address the
			invitation was sent to.
		</p>
		<a href="/knowledge-base" class="mt-2 text-sm text-signal underline">Back to your workspace</a>
	</div>
{:else}
	<ChatbotChat
		chatbot={data.chatbot}
		membership={data.membership}
		conversation={data.conversation}
		ownerName={data.ownerName ?? unnamedChatbotOwner}
	/>
{/if}
