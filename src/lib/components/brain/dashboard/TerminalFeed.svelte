<script lang="ts">
	import IngestWorkingLine from './IngestWorkingLine.svelte';
	import TerminalTurn from './TerminalTurn.svelte';
	import type { BrainConversationMessage, BrainPageSummary } from '$lib/data/brainTypes';

	let {
		messages,
		pageIndex,
		pageBasePath,
		pendingQuestion,
		isThinking,
		transferLines,
		activeTransferName
	}: {
		messages: BrainConversationMessage[];
		pageIndex: BrainPageSummary[];
		pageBasePath: string;
		pendingQuestion: string | null;
		isThinking: boolean;
		transferLines: string[];
		activeTransferName: string | null;
	} = $props();
</script>

<p class="mb-3 text-xs text-chalk/35">
	query your brain · answers grounded in this brain's own model · credits scale with the work
</p>
<div class="flex flex-col gap-3">
	{#each messages as message (message.id)}
		<TerminalTurn {message} {pageIndex} {pageBasePath} />
	{/each}
	{#if pendingQuestion !== null}
		<p class="text-chalk"><span class="text-signal select-none">❯</span> {pendingQuestion}</p>
	{/if}
	{#if isThinking}
		<p class="animate-pulse pl-4 text-chalk/40">thinking…</p>
	{/if}
	{#each transferLines as line, index (index)}
		<p class="text-chalk/60">{line}</p>
	{/each}
	{#if activeTransferName !== null}
		<IngestWorkingLine sourceName={activeTransferName} />
	{/if}
</div>
