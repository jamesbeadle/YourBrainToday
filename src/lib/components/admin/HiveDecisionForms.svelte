<script lang="ts">
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { enhance } from '$app/forms';
	import { FormTracker } from '$lib/client/formTracker.svelte';

	let { applicationId }: { applicationId: string } = $props();

	const approveTracker = new FormTracker();
	const rejectTracker = new FormTracker();
</script>

<FormErrorNote message={approveTracker.errorMessage ?? rejectTracker.errorMessage} />
<div class="flex flex-wrap items-center gap-3">
	<form method="POST" action="?/approveHiveApplication" use:enhance={approveTracker.submit()}>
		<input type="hidden" name="applicationId" value={applicationId} />
		<SubmitButton
			isSaving={approveTracker.isSaving}
			savingLabel="Approving…"
			class="rounded-full bg-go px-5 py-2 font-display text-sm font-medium text-night
				transition hover:brightness-110"
		>
			Approve & snapshot
		</SubmitButton>
	</form>
	<form
		method="POST"
		action="?/rejectHiveApplication"
		use:enhance={rejectTracker.submit()}
		class="flex flex-1 items-center gap-2"
	>
		<input type="hidden" name="applicationId" value={applicationId} />
		<input
			name="note"
			placeholder="Reason (shown to the owner)"
			aria-label="Rejection reason"
			class="min-w-0 flex-1 rounded-full border border-hairline bg-night px-4 py-2 text-sm
				text-chalk outline-none placeholder:text-chalk/40 focus:border-signal"
		/>
		<SubmitButton
			isSaving={rejectTracker.isSaving}
			savingLabel="Rejecting…"
			class="rounded-full border border-signal/60 px-5 py-2 font-display text-sm text-signal
				transition hover:bg-signal hover:text-night"
		>
			Reject
		</SubmitButton>
	</form>
</div>
