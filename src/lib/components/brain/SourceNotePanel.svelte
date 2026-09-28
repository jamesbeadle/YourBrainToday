<script lang="ts">
	import IngestProgressLabel from './IngestProgressLabel.svelte';
	import { inputClasses, quietButtonClasses } from '$lib/components/site/formStyles';
	import { invalidateAll } from '$app/navigation';
	import { noteTitleFor } from './noteTitle';
	import { uploadSourceFile } from './uploadSourceFile';

	let { brainId, onOutOfCredits }: { brainId: string; onOutOfCredits: () => void } = $props();

	const noteMimeType = 'text/plain';
	const notePlaceholder =
		"Type a note, tap your keyboard's microphone to dictate one, " +
		"or paste a transcript from your phone's voice memos.";

	let noteText = $state('');
	let isSending = $state(false);
	let noticeMessage = $state('');

	const hasNote = $derived(noteText.trim() !== '');

	async function addNote() {
		isSending = true;
		noticeMessage = '';
		const note = new File([noteText.trim()], noteTitleFor(noteText), { type: noteMimeType });
		const outcome = await uploadSourceFile(note, brainId);
		isSending = false;
		await invalidateAll();
		if (outcome.status === 'out_of_credits') return onOutOfCredits();
		if (outcome.status === 'rejected' || outcome.status === 'failed') {
			noticeMessage = outcome.message;
			return;
		}
		noteText = '';
		if (outcome.status === 'proposed') noticeMessage = 'Sent to the owner for review.';
	}
</script>

<div class="flex flex-col gap-3">
	<textarea
		bind:value={noteText}
		rows="4"
		disabled={isSending}
		aria-label="Note"
		placeholder={notePlaceholder}
		class={`${inputClasses} resize-y text-sm placeholder:text-chalk/40`}
	></textarea>
	<button
		type="button"
		disabled={!hasNote || isSending}
		onclick={addNote}
		class={`${quietButtonClasses} self-start disabled:opacity-40`}
	>
		{#if isSending}
			<IngestProgressLabel />
		{:else}
			Add note — credits scale with its length
		{/if}
	</button>
	{#if noticeMessage !== ''}
		<p class="text-sm text-caution">{noticeMessage}</p>
	{/if}
</div>
