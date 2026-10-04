<script lang="ts">
	import { inputClasses, quietButtonClasses } from '$lib/components/site/formStyles';
	import { addLinkedSource } from './addLinkedSource';
	import { recogniseCapture, type CaptureKind } from './captureKind';
	import { noteTitleFor } from './noteTitle';
	import type { SourceUploadQueue } from './sourceUploadQueue.svelte';

	let { brainId, queue }: { brainId: string; queue: SourceUploadQueue } = $props();

	const noteMimeType = 'text/plain';
	const readingLinkLine = 'reading the link…';
	const capturePlaceholder =
		'Paste a link, a post, a message or a screenshot — or type a note, ' +
		"or dictate one with your keyboard's microphone.";
	const buttonLabels: Record<CaptureKind, string> = {
		nothing: 'Add to the brain',
		link: 'Read link — credits scale with the page',
		note: 'Add note — credits scale with its length'
	};

	let capture = $state('');

	const kind = $derived(recogniseCapture(capture));
	const hasCapture = $derived(kind !== 'nothing');

	async function addCapture() {
		const captured = capture.trim();
		capture = '';
		if (kind === 'link') return addLink(captured);
		await addNote(captured);
	}

	function addLink(link: string) {
		void queue.enqueue(link, readingLinkLine, (onProgress) =>
			addLinkedSource(link, brainId, onProgress)
		);
	}

	async function addNote(noteText: string) {
		const note = new File([noteText], noteTitleFor(noteText), { type: noteMimeType });
		const outcome = await queue.enqueueFile(note, brainId);
		const isKept = outcome.status === 'ingested' || outcome.status === 'proposed';
		const isBoxStillEmpty = capture === '';
		if (!isKept && isBoxStillEmpty) capture = noteText;
	}

	function addCaptureOnEnter(event: KeyboardEvent) {
		const isSubmit = event.key === 'Enter' && (kind === 'link' || event.metaKey || event.ctrlKey);
		if (!isSubmit || !hasCapture) return;
		event.preventDefault();
		void addCapture();
	}
</script>

<div class="flex flex-col gap-2">
	<textarea
		bind:value={capture}
		rows="4"
		aria-label="Quick capture"
		placeholder={capturePlaceholder}
		onkeydown={addCaptureOnEnter}
		class={`${inputClasses} resize-y text-sm placeholder:text-chalk/40`}
	></textarea>
	<button
		type="button"
		disabled={!hasCapture}
		onclick={addCapture}
		class={`${quietButtonClasses} self-start disabled:opacity-40`}
	>
		{buttonLabels[kind]}
	</button>
	<p class="text-xs text-chalk/50">
		A link on its own is fetched and read — a GitHub repository like a newcomer would, an X
		profile or post, or any page. Anything else is kept as a note, word for word, so a post
		that cannot be fetched still teaches the brain. A pasted screenshot is read as an image.
	</p>
</div>
