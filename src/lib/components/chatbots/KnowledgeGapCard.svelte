<script lang="ts">
	import { enhance } from '$app/forms';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { askingLineFor } from './knowledgeGapAskingLine';
	import { longestTeachingAnswer, type KnowledgeGap } from '$lib/data/chatbotTypes';

	let { gap, teachingCredits }: { gap: KnowledgeGap; teachingCredits: number } = $props();

	const answerTracker = new FormTracker();
	const dismissTracker = new FormTracker();
	let isAnswering = $state(false);
	let answer = $state('');
</script>

<article class="flex flex-col gap-3 rounded-2xl border border-hairline bg-night p-4">
	<div class="flex flex-wrap items-start justify-between gap-3">
		<div class="flex min-w-0 flex-col gap-1">
			<p class="font-medium text-chalk">“{gap.question}”</p>
			<p class="text-sm text-chalk/60">Needs: {gap.missingKnowledge}</p>
			<p class="text-xs text-chalk/40">{askingLineFor(gap)}</p>
		</div>
		<div class="flex shrink-0 items-center gap-2">
			{#if !isAnswering}
				<button
					type="button"
					onclick={() => (isAnswering = true)}
					class="rounded-full bg-go px-4 py-1.5 font-display text-sm font-medium text-night
						transition hover:brightness-110"
				>
					Answer
				</button>
			{/if}
			<form method="POST" action="?/dismissQuestion" use:enhance={dismissTracker.submit()}>
				<input type="hidden" name="gapId" value={gap.id} />
				<SubmitButton
					isSaving={dismissTracker.isSaving}
					savingLabel="Dismissing…"
					class="rounded-full border border-hairline px-3 py-1.5 text-xs text-chalk/60 transition
						hover:border-signal hover:text-signal"
				>
					Dismiss
				</SubmitButton>
			</form>
		</div>
	</div>
	{#if isAnswering}
		<form
			method="POST"
			action="?/answerQuestion"
			use:enhance={answerTracker.submit(undefined, { shouldKeepFields: true })}
			class="flex flex-col gap-2 border-t border-hairline pt-3"
		>
			<input type="hidden" name="gapId" value={gap.id} />
			<textarea
				name="answer"
				required
				rows="4"
				maxlength={longestTeachingAnswer}
				bind:value={answer}
				placeholder="Answer it the way you would tell a colleague on site…"
				aria-label="Your answer"
				class="min-w-0 resize-none rounded-2xl border border-hairline bg-carriage px-4 py-2.5
					text-sm text-chalk outline-none placeholder:text-chalk/40 focus:border-signal"
			></textarea>
			<FormErrorNote message={answerTracker.errorMessage} />
			<div class="flex items-center gap-3">
				<SubmitButton
					isSaving={answerTracker.isSaving}
					savingLabel="Teaching the bot…"
					disabled={answer.trim() === ''}
					class="rounded-full bg-signal px-5 py-2 font-display text-sm font-medium text-night
						transition hover:brightness-110 disabled:opacity-40"
				>
					Teach the bot · {teachingCredits} credits
				</SubmitButton>
				<button
					type="button"
					onclick={() => (isAnswering = false)}
					class="text-sm text-chalk/50 transition hover:text-chalk"
				>
					Cancel
				</button>
			</div>
		</form>
	{/if}
</article>
