<script lang="ts">
	import { inputClasses, quietButtonClasses } from '$lib/components/site/formStyles';
	import { noteTitleFor } from './noteTitle';
	import type { SourceUploadQueue } from './sourceUploadQueue.svelte';

	let { brainId, queue }: { brainId: string; queue: SourceUploadQueue } = $props();

	const noteMimeType = 'text/plain';
	const notePlaceholder =
		"Type a note, tap your keyboard's microphone to dictate one, " +
		"or paste a transcript from your phone's voice memos.";

	let noteText = $state('');
	let isSending = $state(false);

	const hasNote = $derived(noteText.trim() !== '');

	async function addNote() {
		isSending = true;
		const note = new File([noteText.trim()], noteTitleFor(noteText), { type: noteMimeType });
		const outcome = await queue.enqueue(note, brainId);
		isSending = false;
		const isKept = outcome.status === 'ingested' || outcome.status === 'proposed';
		if (isKept) noteText = '';
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
		{isSending ? 'Queued — see below' : 'Add note — credits scale with its length'}
	</button>
</div>
