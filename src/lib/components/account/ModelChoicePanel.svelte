<script lang="ts">
	import { enhance } from '$app/forms';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import ModelSlider from '$lib/components/site/ModelSlider.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { rungFor } from '$lib/data/modelLadder';

	let {
		modelId,
		adminPinnedModel
	}: { modelId: string; adminPinnedModel: string | null } = $props();

	const tracker = new FormTracker();
	let chosenModel = $derived(modelId);
</script>

<section class="flex flex-col gap-4 rounded-2xl border border-hairline bg-carriage p-6">
	<div class="flex flex-col gap-1">
		<p class="font-display text-sm tracking-widest text-chalk/50 uppercase">AI model</p>
		<p class="text-sm text-chalk/70">
			Every question you ask runs on this model. Each one reserves the model's floor, then
			settles to what the answer actually cost — longer reads cost more, short ones don't.
		</p>
	</div>
	{#if adminPinnedModel !== null}
		<p class="rounded-xl border border-caution/50 bg-caution/10 px-4 py-3 text-sm text-caution">
			An admin has pinned your account to Claude {rungFor(adminPinnedModel).name} — the slider
			is saved but won't apply until the pin is lifted.
		</p>
	{/if}
	<form method="POST" action="?/saveModel" use:enhance={tracker.submit()} class="flex flex-col gap-4">
		<ModelSlider bind:modelId={chosenModel} />
		<FormErrorNote message={tracker.errorMessage} />
		<SubmitButton
			isSaving={tracker.isSaving}
			disabled={rungFor(chosenModel).modelId === rungFor(modelId).modelId}
			class="self-start rounded-full bg-go px-6 py-2.5 font-display text-sm font-medium text-night
				transition hover:brightness-110 disabled:opacity-40"
		>
			Save model
		</SubmitButton>
	</form>
</section>
