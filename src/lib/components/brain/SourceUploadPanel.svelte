<script lang="ts">
	import { acceptedUploadExtensions, uploadLimitDescription } from '$lib/data/brainUploadRules';
	import type { SourceUploadQueue } from './sourceUploadQueue.svelte';

	let { brainId, queue }: { brainId: string; queue: SourceUploadQueue } = $props();

	let fileInput = $state<HTMLInputElement | null>(null);
	let isDraggingOver = $state(false);

	const dropZoneClasses = $derived(
		isDraggingOver ? 'border-go bg-go/5' : 'border-transparent'
	);

	function queueChosenFiles(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		queue.enqueueFiles(Array.from(input.files ?? []), brainId);
		input.value = '';
	}

	function queueDroppedFiles(event: DragEvent) {
		event.preventDefault();
		isDraggingOver = false;
		queue.enqueueFiles(Array.from(event.dataTransfer?.files ?? []), brainId);
	}

	function queuePastedFiles(event: ClipboardEvent) {
		const files = Array.from(event.clipboardData?.files ?? []);
		if (files.length === 0) return;
		event.preventDefault();
		queue.enqueueFiles(files, brainId);
	}

	function showDropTarget(event: DragEvent) {
		event.preventDefault();
		isDraggingOver = true;
	}
</script>

<svelte:window onpaste={queuePastedFiles} />

<div
	role="region"
	aria-label="Add documents"
	ondragover={showDropTarget}
	ondragleave={() => (isDraggingOver = false)}
	ondrop={queueDroppedFiles}
	class={`-m-3 flex flex-col gap-3 rounded-2xl border border-dashed p-3 transition ${dropZoneClasses}`}
>
	<input
		bind:this={fileInput}
		type="file"
		multiple
		accept={acceptedUploadExtensions}
		onchange={queueChosenFiles}
		class="hidden"
	/>
	<button
		type="button"
		onclick={() => fileInput?.click()}
		class="rounded-full bg-signal px-6 py-3 font-display text-sm font-medium text-night
			transition hover:brightness-110"
	>
		Add documents — credits scale with their size
	</button>
	<p class="text-xs text-chalk/50">
		Choose several at once, drop them here or paste them. {uploadLimitDescription()}
	</p>
</div>
