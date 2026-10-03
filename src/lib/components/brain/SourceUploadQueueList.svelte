<script lang="ts">
	import IngestProgressLabel from './IngestProgressLabel.svelte';
	import type { QueuedUpload, QueuedUploadStatus, SourceUploadQueue } from './sourceUploadQueue.svelte';

	let { queue }: { queue: SourceUploadQueue } = $props();

	const toneClasses: Record<QueuedUploadStatus, string> = {
		waiting: 'text-chalk/40',
		sending: 'text-chalk/60 animate-pulse',
		reading: 'text-chalk/60 animate-pulse',
		done: 'text-go',
		failed: 'text-caution'
	};

	function describe(upload: QueuedUpload): string {
		if (upload.status === 'waiting') return 'Waiting its turn';
		if (upload.status === 'sending') return 'sending the file…';
		return upload.message;
	}
</script>

{#if queue.uploads.length > 0}
	<ul class="flex flex-col gap-1">
		{#each queue.uploads as upload (upload.id)}
			<li class="flex flex-wrap items-baseline gap-x-3 text-xs">
				<span class="max-w-full truncate text-chalk/80">{upload.filename}</span>
				<span class={`font-display ${toneClasses[upload.status]}`}>
					{#if upload.status === 'reading'}
						<IngestProgressLabel stage={upload.stageLabel} />
					{:else}
						{describe(upload)}
					{/if}
				</span>
			</li>
		{/each}
	</ul>
	{#if queue.hasFinished}
		<button
			type="button"
			onclick={queue.clearFinished}
			class="self-start font-display text-xs text-chalk/50 underline transition hover:text-chalk"
		>
			Clear finished
		</button>
	{/if}
{/if}
