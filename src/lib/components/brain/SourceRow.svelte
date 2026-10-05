<script lang="ts">
	import SourceArrivalLabel from './SourceArrivalLabel.svelte';
	import SourceContributions from './SourceContributions.svelte';
	import SourceReadingControls from './SourceReadingControls.svelte';
	import SourceRemoveButton from './SourceRemoveButton.svelte';
	import SourceRereadButton from './SourceRereadButton.svelte';
	import SourceStatusBadge from './SourceStatusBadge.svelte';
	import { badNotice, type SourceNotice } from './sourceNotice';
	import { sourceDetailLine } from './sourceDetailLine';
	import type { BrainSource } from '$lib/data/brainTypes';

	let {
		source,
		isOwner,
		pageBasePath,
		onOutOfCredits
	}: {
		source: BrainSource;
		isOwner: boolean;
		pageBasePath: string;
		onOutOfCredits: () => void;
	} = $props();

	let notice = $state<SourceNotice | null>(null);

	const canRemove = $derived(isOwner || source.status !== 'ingested');
	const canReread = $derived(isOwner && source.status === 'ingested');
	const isInTheBrain = $derived(source.status === 'ingested');
	const hasFailed = $derived(source.status === 'failed');
	const detailLine = $derived(sourceDetailLine(source));
</script>

<li class="border-b border-hairline py-3 last:border-b-0">
	<div class="flex items-center justify-between gap-4">
		<div class="min-w-0">
			<p class="truncate text-sm text-chalk">{source.filename}</p>
			<SourceArrivalLabel arrivedThrough={source.arrivedThrough} />
			{#if detailLine !== ''}
				<p class={`truncate text-xs ${hasFailed ? 'text-signal' : 'text-chalk/50'}`}>
					{detailLine}
				</p>
			{/if}
		</div>
		<div class="flex shrink-0 items-center gap-3">
			<SourceReadingControls {source} {onOutOfCredits} onNotice={(next) => (notice = next)} />
			{#if canReread}
				<SourceRereadButton {source} {onOutOfCredits} onNotice={(next) => (notice = next)} />
			{/if}
			<SourceStatusBadge {source} />
			{#if canRemove}
				<SourceRemoveButton
					{source}
					{onOutOfCredits}
					onFailure={(message) => (notice = badNotice(message))}
				/>
			{/if}
		</div>
	</div>
	{#if notice !== null}
		<p class={`mt-1 text-xs ${notice.isGood ? 'text-go' : 'text-caution'}`}>{notice.text}</p>
	{/if}
	{#if isInTheBrain}
		<SourceContributions sourceId={source.id} {pageBasePath} />
	{/if}
</li>
