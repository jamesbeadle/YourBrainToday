<script lang="ts">
	import { enhance } from '$app/forms';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { siteModelChoices } from '$lib/data/siteModels';

	let { siteModel }: { siteModel: string } = $props();

	const tracker = new FormTracker();
</script>

<form
	method="POST"
	action="?/setSiteModel"
	use:enhance={tracker.submit()}
	class="flex flex-col gap-4 rounded-2xl border border-hairline p-5"
>
	<div class="flex flex-col gap-1">
		<h2 class="font-display text-lg font-medium">Site model</h2>
		<p class="text-sm text-chalk/60">The Claude model behind every agent reply on the site.</p>
	</div>
	<div class="flex flex-wrap items-center gap-3">
		<select
			name="modelId"
			value={siteModel}
			class="min-w-64 rounded-full border border-hairline bg-night px-4 py-2 text-sm text-chalk
				outline-none focus:border-go"
		>
			{#each siteModelChoices as choice (choice.modelId)}
				<option value={choice.modelId}>{choice.label}</option>
			{/each}
		</select>
		<SubmitButton
			isSaving={tracker.isSaving}
			savingLabel="Saving…"
			class="rounded-full border border-go/60 px-4 py-1.5 font-display text-sm text-go
				transition hover:bg-go hover:text-night"
		>
			Save
		</SubmitButton>
	</div>
	<FormErrorNote message={tracker.errorMessage} />
</form>
