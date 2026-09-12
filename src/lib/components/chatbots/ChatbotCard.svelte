<script lang="ts">
	import type { ChatbotSummary } from '$lib/data/chatbotTypes';

	let { chatbot }: { chatbot: ChatbotSummary } = $props();

	const memberLabel = $derived(
		chatbot.memberCount === 1 ? '1 member' : `${chatbot.memberCount} members`
	);
</script>

<a
	href={`/chatbots/${chatbot.id}/manage`}
	class="group flex items-center justify-between gap-3 rounded-2xl border border-hairline
		bg-carriage px-4 py-3 transition hover:border-chalk/30"
>
	<span class="flex min-w-0 flex-col gap-0.5">
		<span class="flex items-center gap-2">
			<span class="truncate font-display text-sm text-chalk transition group-hover:text-signal">
				{chatbot.name}
			</span>
			{#if chatbot.isPaused}
				<span class="rounded-full border border-caution/50 px-2 py-0.5 text-[10px] text-caution">
					Paused
				</span>
			{/if}
			{#if chatbot.openQuestionCount > 0}
				<span class="rounded-full border border-signal/50 px-2 py-0.5 text-[10px] text-signal">
					{chatbot.openQuestionCount} unanswered
				</span>
			{/if}
		</span>
		<span class="text-xs text-chalk/50">{memberLabel}</span>
	</span>
	<span class="shrink-0 text-right">
		<span class="block font-mono text-sm text-chalk">{chatbot.poolCredits}</span>
		<span class="block text-[10px] tracking-wider text-chalk/40 uppercase">credits left</span>
	</span>
</a>
