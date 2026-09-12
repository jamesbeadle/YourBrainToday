<script lang="ts">
	import { enhance } from '$app/forms';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import type { ChatbotSummary } from '$lib/data/chatbotTypes';

	let { chatbot }: { chatbot: ChatbotSummary } = $props();

	const pauseTracker = new FormTracker();
</script>

<header class="flex flex-wrap items-end justify-between gap-4">
	<div class="flex flex-col gap-2">
		<a
			href={`/knowledge-base/${chatbot.knowledgeBaseId}`}
			class="font-display text-sm tracking-widest text-signal uppercase hover:underline"
		>
			← Knowledge base
		</a>
		<h1 class="flex items-center gap-3 font-display text-3xl font-medium">
			{chatbot.name}
			{#if chatbot.isPaused}
				<span class="rounded-full border border-caution/50 px-3 py-1 text-xs text-caution">
					Paused
				</span>
			{/if}
		</h1>
		<p class="text-sm text-chalk/60">
			Members open it at <a href={`/chatbots/${chatbot.id}`} class="text-chalk underline"
				>/chatbots/{chatbot.id}</a
			>
		</p>
	</div>
	<div class="flex items-center gap-4">
		<div class="text-right">
			<p class="font-mono text-2xl text-chalk">{chatbot.poolCredits}</p>
			<p class="text-[10px] tracking-wider text-chalk/40 uppercase">credits in the pool</p>
		</div>
		<form method="POST" action="?/setPaused" use:enhance={pauseTracker.submit()}>
			<input type="hidden" name="isPaused" value={String(!chatbot.isPaused)} />
			<SubmitButton
				isSaving={pauseTracker.isSaving}
				class="rounded-full border border-hairline px-4 py-2 font-display text-sm text-chalk/80
					transition hover:border-signal hover:text-signal"
			>
				{chatbot.isPaused ? 'Resume' : 'Pause'}
			</SubmitButton>
		</form>
	</div>
</header>
