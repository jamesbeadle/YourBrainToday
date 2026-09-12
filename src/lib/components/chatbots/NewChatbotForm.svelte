<script lang="ts">
	import { enhance } from '$app/forms';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { knowledgeBaseActionHref } from '$lib/data/knowledge/knowledgeBaseRoutes';

	let { knowledgeBaseId }: { knowledgeBaseId: string } = $props();

	const tracker = new FormTracker();
</script>

<form
	method="POST"
	action={knowledgeBaseActionHref(knowledgeBaseId, 'createChatbot')}
	use:enhance={tracker.submit()}
	class="flex flex-col gap-2"
>
	<div class="flex items-center gap-2">
		<input
			type="text"
			name="name"
			required
			maxlength="80"
			placeholder="Site Foreman Bot"
			class="flex-1 rounded-xl border border-hairline bg-night px-4 py-2 text-sm text-chalk
				outline-none focus:border-signal"
		/>
		<SubmitButton isSaving={tracker.isSaving} savingLabel="Creating…">Create</SubmitButton>
	</div>
	<FormErrorNote message={tracker.errorMessage} />
</form>
