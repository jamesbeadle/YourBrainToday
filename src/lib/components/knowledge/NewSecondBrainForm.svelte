<script lang="ts">
	import { enhance } from '$app/forms';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import type { KnowledgeKindDefinition } from '$lib/data/knowledge/knowledgeKinds';
	import type { KbBrainSummary } from '$lib/data/knowledge/knowledgeTypes';

	let {
		kind,
		expertiseBrains
	}: { kind: KnowledgeKindDefinition; expertiseBrains: KbBrainSummary[] } = $props();

	const tracker = new FormTracker();
	const canBindExpertise = $derived(kind.kind === 'experience' && expertiseBrains.length > 0);
	const descriptionLabel = $derived(kind.kind === 'expertise' ? 'Domain goal' : 'Description');
</script>

<form
	method="POST"
	action="?/createBrain"
	use:enhance={tracker.submit()}
	class="flex flex-col gap-4 rounded-2xl border border-hairline bg-carriage p-5"
	style={`border-top: 3px solid ${kind.accent}`}
>
	<input type="hidden" name="kind" value={kind.kind} />
	<h2 class="font-display text-lg font-medium">New {kind.label} Brain</h2>
	<label class="flex flex-col gap-1">
		<span class="font-display text-sm tracking-widest text-chalk/50 uppercase">Name</span>
		<input
			name="name"
			required
			class="rounded-xl border border-hairline bg-night px-4 py-2.5 text-chalk outline-none
				focus:border-signal"
		/>
	</label>
	{#if kind.kind !== 'process'}
		<label class="flex flex-col gap-1">
			<span class="font-display text-sm tracking-widest text-chalk/50 uppercase">
				{descriptionLabel}
			</span>
			<textarea
				name="description"
				rows="2"
				class="rounded-xl border border-hairline bg-night px-4 py-2.5 text-chalk outline-none
					focus:border-signal"
			></textarea>
		</label>
	{/if}
	{#if canBindExpertise}
		<fieldset class="flex flex-col gap-2">
			<legend class="font-display text-sm tracking-widest text-chalk/50 uppercase">
				Guided by which expertise brains?
			</legend>
			{#each expertiseBrains as expertiseBrain (expertiseBrain.id)}
				<label class="flex items-center gap-2 text-sm text-chalk/80">
					<input
						type="checkbox"
						name="boundDomainBrainIds"
						value={expertiseBrain.id}
						class="accent-signal"
					/>
					{expertiseBrain.name}
				</label>
			{/each}
		</fieldset>
	{/if}
	<FormErrorNote message={tracker.errorMessage} />
	<SubmitButton
		isSaving={tracker.isSaving}
		savingLabel="Creating…"
		class="self-end rounded-full bg-signal px-6 py-2.5 font-display text-sm font-medium
			text-night transition hover:brightness-110"
	>
		Create brain
	</SubmitButton>
</form>
