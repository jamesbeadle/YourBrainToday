<script lang="ts">
	import PreferredAnswersList from './PreferredAnswersList.svelte';
	import QuestionLogEntry from './QuestionLogEntry.svelte';
	import { mostExchangesShown, type ChatbotExchange } from '$lib/data/chatbotQuestionLog';
	import type { ChatbotRuling } from '$lib/data/chatbotRulings';
	import type { ChatbotSummary } from '$lib/data/chatbotTypes';

	let {
		chatbot,
		exchanges,
		rulings
	}: {
		chatbot: ChatbotSummary;
		exchanges: ChatbotExchange[];
		rulings: ChatbotRuling[];
	} = $props();
</script>

<section class="flex flex-col gap-4 rounded-2xl border border-hairline bg-carriage p-5">
	<div class="flex flex-wrap items-start justify-between gap-3">
		<div class="flex flex-col gap-1">
			<h2 class="flex items-center gap-3 font-display text-lg font-medium">
				Questions asked
				{#if exchanges.length > 0}
					<span class="rounded-full border border-hairline px-2.5 py-0.5 font-mono text-xs text-chalk/60">
						{exchanges.length}
					</span>
				{/if}
			</h2>
			<p class="text-sm text-chalk/60">
				Every question your members have put to {chatbot.name}, with what it answered — the record
				that they asked before they acted. Set a preferred answer on any of them and the bot gives
				your answer from then on.
			</p>
		</div>
		{#if exchanges.length > 0}
			<a
				href={`/chatbots/${chatbot.id}/manage/questions.csv`}
				download
				class="rounded-full border border-hairline px-4 py-1.5 font-display text-xs text-chalk/70
					transition hover:border-chalk/40 hover:text-chalk"
			>
				Download the record (CSV)
			</a>
		{/if}
	</div>
	{#if exchanges.length === 0}
		<p class="text-sm text-chalk/50">Nothing asked yet — the record starts with the first question.</p>
	{:else}
		<ul class="flex flex-col gap-3">
			{#each exchanges as exchange (exchange.id)}
				<li><QuestionLogEntry {exchange} /></li>
			{/each}
		</ul>
		{#if exchanges.length >= mostExchangesShown}
			<p class="text-xs text-chalk/40">The newest {mostExchangesShown} exchanges are shown.</p>
		{/if}
	{/if}
	<PreferredAnswersList {rulings} />
</section>
