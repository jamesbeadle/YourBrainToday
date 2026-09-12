<script lang="ts">
	import { creditsPerBrainPrune } from '$lib/data/creditPricing';
	import { invalidateAll } from '$app/navigation';

	let { brainId, onOutOfCredits }: { brainId: string; onOutOfCredits: () => void } = $props();

	let isPruning = $state(false);
	let noticeMessage = $state('');

	async function pruneKnowledge() {
		isPruning = true;
		noticeMessage = '';
		const response = await fetch('/api/brain/prune', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ brainId })
		});
		isPruning = false;
		if (response.status === 402) return onOutOfCredits();
		if (!response.ok) {
			noticeMessage = (await response.json())?.message ?? 'Pruning failed — nothing was changed.';
			return;
		}
		const outcome = await response.json();
		noticeMessage = pruneSummary(outcome);
		await invalidateAll();
	}

	function pruneSummary(outcome: {
		logLine: string;
		pagesWritten: number;
		pagesRetired: number;
		contextsDeleted: number;
	}): string {
		if (outcome.pagesWritten + outcome.pagesRetired + outcome.contextsDeleted === 0) {
			return outcome.logLine === '' ? 'Nothing needed pruning.' : outcome.logLine;
		}
		return outcome.logLine;
	}
</script>

<div class="flex flex-col gap-2">
	<button
		type="button"
		disabled={isPruning}
		onclick={pruneKnowledge}
		class="self-start rounded-full border border-hairline px-4 py-2 font-display text-xs
			text-chalk/70 transition hover:border-chalk/40 hover:text-chalk disabled:opacity-40"
	>
		{#if isPruning}
			Pruning — merging duplicates and resolving contradictions…
		{:else}
			Prune knowledge — {creditsPerBrainPrune} credits
		{/if}
	</button>
	{#if noticeMessage !== ''}
		<p class="text-xs text-chalk/50">{noticeMessage}</p>
	{/if}
</div>
