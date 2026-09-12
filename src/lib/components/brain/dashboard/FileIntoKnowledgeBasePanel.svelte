<script lang="ts">
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { enhance } from '$app/forms';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import type { KnowledgeBaseSummary } from '$lib/data/knowledge/knowledgeTypes';

	let {
		knowledgeBases,
		filedKnowledgeBaseName
	}: {
		knowledgeBases: KnowledgeBaseSummary[];
		filedKnowledgeBaseName: string | null;
	} = $props();

	const tracker = new FormTracker();
</script>

<section class="flex flex-col gap-2 border-t border-hairline pt-6">
	<h3 class="font-display text-sm text-chalk">Knowledge base</h3>
	{#if filedKnowledgeBaseName !== null}
		<p class="text-xs leading-relaxed text-chalk/60">
			This brain is filed in <span class="text-chalk">{filedKnowledgeBaseName}</span> — it
			shows up there as an expertise brain.
		</p>
	{:else if knowledgeBases.length === 0}
		<p class="text-xs leading-relaxed text-chalk/60">
			This brain isn't filed in a knowledge base yet — create one and it can be filed from here.
		</p>
	{:else}
		<p class="text-xs leading-relaxed text-chalk/60">
			This brain isn't filed in a knowledge base yet. File it and it appears there as an
			expertise brain.
		</p>
		<form
			method="POST"
			action="?/fileIntoKnowledgeBase"
			use:enhance={tracker.submit()}
			class="flex items-center gap-2"
		>
			<select
				name="knowledgeBaseId"
				required
				aria-label="Knowledge base to file into"
				class="min-w-0 flex-1 rounded-xl border border-hairline bg-carriage px-3 py-2 text-sm
					text-chalk"
			>
				{#each knowledgeBases as knowledgeBase (knowledgeBase.id)}
					<option value={knowledgeBase.id}>{knowledgeBase.name}</option>
				{/each}
			</select>
			<SubmitButton
				isSaving={tracker.isSaving}
				savingLabel="Filing…"
				class="rounded-full border border-hairline px-4 py-2 font-display text-sm text-chalk/80
					transition hover:border-signal hover:text-signal"
			>
				File it
			</SubmitButton>
		</form>
	{/if}
</section>
