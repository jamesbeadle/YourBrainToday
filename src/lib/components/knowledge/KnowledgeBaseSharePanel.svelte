<script lang="ts">
	import { enhance } from '$app/forms';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { knowledgeBaseActionHref } from '$lib/data/knowledge/knowledgeBaseRoutes';
	import type { KnowledgeBaseShare } from '$lib/server/knowledge/knowledgeBaseShares';

	let {
		knowledgeBaseId,
		shares
	}: { knowledgeBaseId: string; shares: KnowledgeBaseShare[] } = $props();

	const shareTracker = new FormTracker();
</script>

<div class="flex flex-col gap-4">
	<p class="text-sm text-chalk/60">
		Viewers can browse every brain in this knowledge base but can't change anything.
	</p>
	<form
		method="POST"
		action={knowledgeBaseActionHref(knowledgeBaseId, 'shareKnowledgeBase')}
		use:enhance={shareTracker.submit()}
		class="flex items-center gap-2"
	>
		<input
			type="email"
			name="viewerEmail"
			required
			placeholder="colleague@company.co.uk"
			class="flex-1 rounded-xl border border-hairline bg-night px-4 py-2 text-sm text-chalk
				outline-none focus:border-signal"
		/>
		<SubmitButton isSaving={shareTracker.isSaving} savingLabel="Sharing…">Share</SubmitButton>
	</form>
	<FormErrorNote message={shareTracker.errorMessage} />
	{#if shares.length > 0}
		<ul class="flex flex-col divide-y divide-hairline">
			{#each shares as share (share.id)}
				<li class="flex items-center justify-between gap-3 py-2">
					<span class="truncate text-sm">{share.viewerEmail}</span>
					<form
						method="POST"
						action={knowledgeBaseActionHref(knowledgeBaseId, 'removeShare')}
						use:enhance
					>
						<input type="hidden" name="shareId" value={share.id} />
						<button
							type="submit"
							class="rounded-full border border-hairline px-3 py-1 text-xs text-chalk/60
								transition hover:border-signal hover:text-signal"
						>
							Remove
						</button>
					</form>
				</li>
			{/each}
		</ul>
	{/if}
</div>
