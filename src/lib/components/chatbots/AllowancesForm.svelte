<script lang="ts">
	import { enhance } from '$app/forms';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import MemberAllowanceFields from './MemberAllowanceFields.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import type { ChatbotMember, ChatbotSummary } from '$lib/data/chatbotTypes';

	let { chatbot, members }: { chatbot: ChatbotSummary; members: ChatbotMember[] } = $props();

	const tracker = new FormTracker();
</script>

<form
	method="POST"
	action="?/updateAllowances"
	use:enhance={tracker.submit()}
	class="flex flex-col gap-4 border-t border-hairline pt-4"
>
	<div class="flex flex-col gap-1">
		<h3 class="font-display text-sm text-chalk">Allowances this period</h3>
		<p class="text-xs leading-relaxed text-chalk/60">
			Change what each member may spend without adding credits. What they have already spent
			stays counted; a top-up is what starts the period again.
		</p>
	</div>
	<MemberAllowanceFields {members} poolCredits={chatbot.poolCredits} />
	<FormErrorNote message={tracker.errorMessage} />
	<SubmitButton
		isSaving={tracker.isSaving}
		class="self-start rounded-full border border-hairline px-5 py-2 font-display text-sm text-chalk/80
			transition hover:border-signal hover:text-signal"
	>
		Update allowances
	</SubmitButton>
</form>
