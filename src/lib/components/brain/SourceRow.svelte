<script lang="ts">
	import IngestProgressLabel from './IngestProgressLabel.svelte';
	import SourceRemoveButton from './SourceRemoveButton.svelte';
	import SourceRereadButton from './SourceRereadButton.svelte';
	import { ingestSource } from './uploadSourceFile';
	import { invalidateAll } from '$app/navigation';
	import type { BrainSource } from '$lib/data/brainTypes';

	let {
		source,
		isOwner,
		onOutOfCredits
	}: { source: BrainSource; isOwner: boolean; onOutOfCredits: () => void } = $props();

	let isRetrying = $state(false);
	let failureMessage = $state('');

	const statusStyles: Record<BrainSource['status'], string> = {
		uploaded: 'border-chalk/30 text-chalk/60',
		ingested: 'border-go/60 text-go',
		failed: 'border-signal/60 text-signal',
		proposed: 'border-caution/60 text-caution',
		rejected: 'border-signal/60 text-signal'
	};

	const statusLabels: Record<BrainSource['status'], string> = {
		uploaded: 'Waiting',
		ingested: 'In the brain',
		failed: 'Failed',
		proposed: 'Awaiting review',
		rejected: 'Rejected'
	};

	const canRemove = $derived(isOwner || source.status !== 'ingested');
	const canReread = $derived(isOwner && source.status === 'ingested');

	async function retryIngest() {
		isRetrying = true;
		const outcome = await ingestSource(source.id);
		isRetrying = false;
		if (outcome.status === 'out_of_credits') return onOutOfCredits();
		await invalidateAll();
	}
</script>

<li class="flex items-center justify-between gap-4 border-b border-hairline py-3 last:border-b-0">
	<div class="min-w-0">
		<p class="truncate text-sm text-chalk">{source.filename}</p>
		{#if source.summary !== ''}
			<p class="truncate text-xs text-chalk/50">{source.summary}</p>
		{/if}
	</div>
	<div class="flex shrink-0 items-center gap-3">
		{#if source.status === 'failed' || source.status === 'uploaded'}
			<button
				type="button"
				disabled={isRetrying}
				onclick={retryIngest}
				class="font-display text-xs text-chalk/70 underline transition hover:text-chalk
					disabled:opacity-40"
			>
				{#if isRetrying}
					<IngestProgressLabel />
				{:else}
					Read it
				{/if}
			</button>
		{/if}
		{#if canReread}
			<SourceRereadButton
				{source}
				{onOutOfCredits}
				onFailure={(message) => (failureMessage = message)}
			/>
		{/if}
		<span
			class={`rounded-full border px-3 py-1 font-display text-xs ${statusStyles[source.status]}`}
		>
			{statusLabels[source.status]}
		</span>
		{#if canRemove}
			<SourceRemoveButton
				{source}
				{onOutOfCredits}
				onFailure={(message) => (failureMessage = message)}
			/>
		{/if}
	</div>
</li>
{#if failureMessage !== ''}
	<li class="border-b border-hairline pb-2 text-xs text-caution last:border-b-0">
		{failureMessage}
	</li>
{/if}
