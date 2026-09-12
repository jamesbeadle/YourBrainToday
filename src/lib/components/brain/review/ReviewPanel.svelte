<script lang="ts">
	import ProposalRow from './ProposalRow.svelte';
	import ReviewDecisionBar from './ReviewDecisionBar.svelte';
	import { SvelteSet } from 'svelte/reactivity';
	import { invalidateAll } from '$app/navigation';
	import type { BrainChangeProposal } from '$lib/data/sharingTypes';

	let {
		brainId,
		proposals
	}: { brainId: string; proposals: BrainChangeProposal[] } = $props();

	const checkedIds = new SvelteSet<string>();
	let isDeciding = $state(false);
	let failureMessage = $state('');

	const sourceFilenames = $derived([...new Set(proposals.map((p) => p.sourceFilename))]);

	function proposalsFrom(filename: string): BrainChangeProposal[] {
		return proposals.filter((proposal) => proposal.sourceFilename === filename);
	}

	function toggle(proposalId: string): void {
		if (!checkedIds.delete(proposalId)) checkedIds.add(proposalId);
	}

	function selectAll(): void {
		for (const proposal of proposals) checkedIds.add(proposal.id);
	}

	async function decide(verdict: 'approve' | 'reject') {
		isDeciding = true;
		failureMessage = '';
		const selected = [...checkedIds];
		const response = await fetch('/api/brain/proposals', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({
				brainId,
				approvedIds: verdict === 'approve' ? selected : [],
				rejectedIds: verdict === 'reject' ? selected : []
			})
		});
		isDeciding = false;
		if (!response.ok) return (failureMessage = 'That decision went wrong — try again.');
		checkedIds.clear();
		await invalidateAll();
	}
</script>

<div class="flex h-full min-h-0 flex-col">
	<div class="min-h-0 flex-1 overflow-y-auto p-4">
		{#if proposals.length === 0}
			<p class="text-sm text-chalk/50">
				Nothing waiting. When a collaborator adds a document, its model changes land here for
				your review.
			</p>
		{:else}
			<div class="mb-2 flex items-center justify-between">
				<p class="text-xs text-chalk/50">{proposals.length} proposed changes</p>
				<button
					type="button"
					onclick={selectAll}
					class="font-display text-xs text-chalk/60 underline transition hover:text-chalk"
				>
					Select all
				</button>
			</div>
			{#each sourceFilenames as filename (filename)}
				<div class="mb-3">
					<p class="font-display text-[10px] tracking-widest text-chalk/40 uppercase">
						{filename} · {proposalsFrom(filename)[0]?.proposerEmail}
					</p>
					<ul class="flex flex-col">
						{#each proposalsFrom(filename) as proposal (proposal.id)}
							<ProposalRow
								{proposal}
								isChecked={checkedIds.has(proposal.id)}
								onToggle={() => toggle(proposal.id)}
							/>
						{/each}
					</ul>
				</div>
			{/each}
		{/if}
		{#if failureMessage !== ''}
			<p class="text-xs text-caution">{failureMessage}</p>
		{/if}
	</div>
	{#if proposals.length > 0}
		<ReviewDecisionBar
			selectedCount={checkedIds.size}
			{isDeciding}
			onDecide={decide}
		/>
	{/if}
</div>
