<script lang="ts">
	import { enhance } from '$app/forms';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { longestPreferredAnswer, longestRulingQuestion } from '$lib/data/chatbotRulings';

	let {
		question = null,
		askedByMemberId = null,
		onDone
	}: {
		question?: string | null;
		askedByMemberId?: string | null;
		onDone: () => void;
	} = $props();

	const tracker = new FormTracker();
	let draftQuestion = $state('');
	let answer = $state('');

	const fieldClasses = `min-w-0 rounded-2xl border border-hairline bg-carriage px-4 py-2.5 text-sm
		text-chalk outline-none placeholder:text-chalk/40 focus:border-signal`;
</script>

<form
	method="POST"
	action="?/setPreferredAnswer"
	use:enhance={tracker.submit(onDone, { shouldKeepFields: true })}
	class="flex flex-col gap-2 border-t border-hairline pt-3"
>
	{#if question === null}
		<input
			type="text"
			name="question"
			required
			maxlength={longestRulingQuestion}
			bind:value={draftQuestion}
			placeholder="The question, as a member would ask it…"
			aria-label="The question"
			class={fieldClasses}
		/>
	{:else}
		<input type="hidden" name="question" value={question} />
	{/if}
	{#if askedByMemberId !== null}
		<input type="hidden" name="askedByMemberId" value={askedByMemberId} />
	{/if}
	<textarea
		name="answer"
		required
		rows="4"
		maxlength={longestPreferredAnswer}
		bind:value={answer}
		placeholder="The answer you would rather it gave…"
		aria-label="The preferred answer"
		class={`${fieldClasses} resize-none`}
	></textarea>
	<FormErrorNote message={tracker.errorMessage} />
	<div class="flex items-center gap-3">
		<SubmitButton
			isSaving={tracker.isSaving}
			savingLabel="Saving…"
			disabled={answer.trim() === '' || (question === null && draftQuestion.trim() === '')}
			class="rounded-full bg-signal px-5 py-2 font-display text-sm font-medium text-night
				transition hover:brightness-110 disabled:opacity-40"
		>
			Save preferred answer
		</SubmitButton>
		<button type="button" onclick={onDone} class="text-sm text-chalk/50 transition hover:text-chalk">
			Cancel
		</button>
	</div>
</form>
