<script lang="ts">
	import MarkdownBody from '../brain/MarkdownBody.svelte';
	import PreferredAnswerForm from './PreferredAnswerForm.svelte';
	import { askedLineFor, citationLineFor } from './questionLogLines';
	import type { ChatbotExchange } from '$lib/data/chatbotQuestionLog';

	let { exchange }: { exchange: ChatbotExchange } = $props();

	let isExpanded = $state(false);
	let isSettingAnswer = $state(false);

	const citationLine = $derived(citationLineFor(exchange));
</script>

<article class="flex flex-col gap-3 rounded-2xl border border-hairline bg-night p-4">
	<div class="flex flex-wrap items-start justify-between gap-3">
		<div class="flex min-w-0 flex-col gap-1">
			<p class="font-medium text-chalk">“{exchange.question}”</p>
			<p class="text-xs text-chalk/40">
				{askedLineFor(exchange)}{#if citationLine !== null} · {citationLine}{/if}
			</p>
		</div>
		<div class="flex shrink-0 items-center gap-2">
			{#if exchange.hasPreferredAnswer}
				<span class="rounded-full border border-go/50 px-2.5 py-0.5 text-xs text-go">
					Preferred answer set
				</span>
			{/if}
			{#if !isSettingAnswer}
				<button
					type="button"
					onclick={() => (isSettingAnswer = true)}
					class="rounded-full border border-hairline px-3 py-1.5 text-xs text-chalk/60 transition
						hover:border-signal hover:text-signal"
				>
					{exchange.hasPreferredAnswer ? 'Change preferred answer' : 'Set preferred answer'}
				</button>
			{/if}
		</div>
	</div>
	<div class={`text-sm text-chalk/70 ${isExpanded ? '' : 'line-clamp-3'}`}>
		<MarkdownBody markdown={exchange.answerMarkdown} />
	</div>
	<button
		type="button"
		onclick={() => (isExpanded = !isExpanded)}
		class="self-start text-xs text-chalk/50 transition hover:text-chalk"
	>
		{isExpanded ? 'Show less' : 'Show the whole answer'}
	</button>
	{#if isSettingAnswer}
		<PreferredAnswerForm question={exchange.question} onDone={() => (isSettingAnswer = false)} />
	{/if}
</article>
