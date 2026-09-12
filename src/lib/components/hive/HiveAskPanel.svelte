<script lang="ts">
	import AgentTypingIndicator from '../chat/AgentTypingIndicator.svelte';
	import HiveAnswerCard from './HiveAnswerCard.svelte';
	import OutOfCreditsNotice from '../workspace/OutOfCreditsNotice.svelte';
	import { creditsPerTradeTalkQuestion } from '$lib/data/creditPricing';
	import { invalidateAll } from '$app/navigation';
	import type { HiveAnswer } from '$lib/data/hiveTypes';

	let { isSignedIn, hasSpecialists }: { isSignedIn: boolean; hasSpecialists: boolean } = $props();

	let draft = $state('');
	let askedQuestion = $state('');
	let isThinking = $state(false);
	let isOutOfCredits = $state(false);
	let failureMessage = $state<string | null>(null);
	let answer = $state<HiveAnswer | null>(null);

	async function askHive(event: SubmitEvent) {
		event.preventDefault();
		const question = draft.trim();
		if (question === '' || isThinking) return;
		askedQuestion = question;
		isThinking = true;
		isOutOfCredits = false;
		failureMessage = null;
		answer = null;
		const response = await fetch('/api/hive-mind/ask', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ question })
		});
		isThinking = false;
		if (response.status === 402) {
			isOutOfCredits = true;
			return;
		}
		if (!response.ok) {
			failureMessage = 'That question went wrong — your credits have been refunded.';
			return;
		}
		answer = await response.json();
		draft = '';
		await invalidateAll();
	}
</script>

<section class="mx-auto max-w-6xl px-6 pb-16">
	<div class="flex flex-col gap-4 rounded-2xl border border-hairline bg-carriage p-6 md:p-8">
		<div>
			<h2 class="font-display text-xl font-medium">Ask the trades</h2>
			<p class="text-sm text-chalk/60">
				One question consults every trade — from {creditsPerTradeTalkQuestion} credits, scaling with how many brains weigh in.
			</p>
		</div>
		{#if !isSignedIn}
			<a
				href="/account/sign-in"
				class="self-start rounded-full bg-signal px-6 py-2.5 font-display text-sm font-medium
					text-night transition hover:brightness-110"
			>
				Sign in to ask
			</a>
		{:else if !hasSpecialists}
			<p class="text-sm text-chalk/60">
				No trades are talking yet — the first approved second brains will appear here.
			</p>
		{:else}
			<form onsubmit={askHive} class="flex flex-col gap-3 sm:flex-row">
				<input
					bind:value={draft}
					placeholder="Ask something only a specialist would know…"
					aria-label="Ask Trade Talk"
					class="flex-1 rounded-full border border-hairline bg-night px-5 py-3 text-chalk
						outline-none placeholder:text-chalk/40 focus:border-signal"
				/>
				<button
					type="submit"
					disabled={isThinking}
					class="rounded-full bg-signal px-6 py-3 font-display text-sm font-medium text-night
						transition hover:brightness-110 disabled:opacity-40"
				>
					{isThinking ? 'Consulting…' : 'Ask the trades'}
				</button>
			</form>
			{#if isThinking}
				<AgentTypingIndicator />
			{/if}
			{#if failureMessage !== null}
				<p class="text-sm text-caution">{failureMessage}</p>
			{/if}
			{#if isOutOfCredits}
				<OutOfCreditsNotice />
			{/if}
			{#if answer !== null}
				<HiveAnswerCard question={askedQuestion} {answer} />
			{/if}
		{/if}
	</div>
</section>
