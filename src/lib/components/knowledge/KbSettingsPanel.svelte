<script lang="ts">
	import DangerConfirmModal from '$lib/components/site/DangerConfirmModal.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { enhance } from '$app/forms';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { knowledgeBaseActionHref } from '$lib/data/knowledge/knowledgeBaseRoutes';
	import type { KnowledgeBase } from '$lib/server/knowledge/getKnowledgeBase';

	let { knowledgeBase }: { knowledgeBase: KnowledgeBase } = $props();

	const tracker = new FormTracker();
	let isDeleteModalOpen = $state(false);
</script>

<div class="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-4">
	<section class="flex flex-col gap-1">
		<h3 class="font-display text-sm text-chalk">{knowledgeBase.name}</h3>
		{#if knowledgeBase.description !== ''}
			<p class="text-xs leading-relaxed text-chalk/60">{knowledgeBase.description}</p>
		{/if}
	</section>
	<section class="flex flex-col gap-2 border-t border-hairline pt-5">
		<h3 class="font-display text-sm text-chalk">
			{knowledgeBase.isArchived ? 'Archived' : 'Archive'}
		</h3>
		<p class="text-xs leading-relaxed text-chalk/60">
			{knowledgeBase.isArchived
				? 'This knowledge base is archived — it stays readable but fades in the register.'
				: 'Archiving keeps everything but moves this knowledge base out of the way.'}
		</p>
		<form
			method="POST"
			action={knowledgeBaseActionHref(knowledgeBase.id, 'setArchived')}
			use:enhance={tracker.submit()}
		>
			<input type="hidden" name="isArchived" value={String(!knowledgeBase.isArchived)} />
			<SubmitButton
				isSaving={tracker.isSaving}
				savingLabel="Saving…"
				class="rounded-full border border-hairline px-4 py-2 font-display text-sm text-chalk/80
					transition hover:border-signal hover:text-signal"
			>
				{knowledgeBase.isArchived ? 'Unarchive' : 'Archive'}
			</SubmitButton>
		</form>
	</section>
	<section class="flex flex-col gap-2 border-t border-hairline pt-5">
		<h3 class="font-display text-sm text-signal">Delete this knowledge base</h3>
		<p class="text-xs leading-relaxed text-chalk/60">
			Everything goes with it — every second brain, everything they have learned, every source
			document, process map, share, and log entry. Archiving is the gentler option if you might
			want it back.
		</p>
		<button
			type="button"
			onclick={() => (isDeleteModalOpen = true)}
			class="self-start rounded-full border border-signal/60 px-4 py-2 font-display text-sm
				text-signal transition hover:bg-signal hover:text-night"
		>
			Delete knowledge base
		</button>
	</section>
</div>

<DangerConfirmModal
	title="Delete this knowledge base?"
	description={`${knowledgeBase.name} and all three of its second brains — everything they have
		learned, every source document, process map, and share — are deleted with it. This cannot
		be undone.`}
	action={knowledgeBaseActionHref(knowledgeBase.id, 'deleteKnowledgeBase')}
	fields={{}}
	submitLabel="Delete knowledge base"
	confirmWord="DELETE"
	bind:isOpen={isDeleteModalOpen}
/>
