<script lang="ts">
	import { enhance } from '$app/forms';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';

	const tracker = new FormTracker();
</script>

<form
	method="POST"
	action="?/createKnowledgeBase"
	use:enhance={tracker.submit()}
	class="flex flex-col gap-4"
>
	<label class="flex flex-col gap-1">
		<span class="font-display text-sm tracking-widest text-chalk/50 uppercase">Name</span>
		<input
			name="name"
			required
			placeholder="Company knowledge, research library, product handbook…"
			class="rounded-xl border border-hairline bg-night px-4 py-2.5 text-chalk outline-none
				focus:border-signal"
		/>
	</label>
	<label class="flex flex-col gap-1">
		<span class="font-display text-sm tracking-widest text-chalk/50 uppercase">Description</span>
		<textarea
			name="description"
			rows="2"
			placeholder="What lives in this knowledge base?"
			class="rounded-xl border border-hairline bg-night px-4 py-2.5 text-chalk outline-none
				focus:border-signal"
		></textarea>
	</label>
	<FormErrorNote message={tracker.errorMessage} />
	<SubmitButton
		isSaving={tracker.isSaving}
		savingLabel="Creating…"
		class="self-end rounded-full bg-signal px-6 py-2.5 font-display text-sm font-medium
			text-night transition hover:brightness-110"
	>
		Create knowledge base
	</SubmitButton>
</form>
