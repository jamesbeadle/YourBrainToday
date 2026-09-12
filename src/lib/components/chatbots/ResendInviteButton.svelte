<script lang="ts">
	import { enhance } from '$app/forms';
	import { FormTracker } from '$lib/client/formTracker.svelte';

	let { memberId }: { memberId: string } = $props();

	const tracker = new FormTracker();
	let hasSent = $state(false);
</script>

<form
	method="POST"
	action="?/resendInvite"
	use:enhance={tracker.submit(() => (hasSent = true))}
	class="inline-flex flex-col items-end gap-1"
>
	<input type="hidden" name="memberId" value={memberId} />
	<button
		type="submit"
		disabled={tracker.isSaving}
		title={tracker.errorMessage ?? ''}
		class="rounded-full border border-hairline px-3 py-1 text-xs text-chalk/60 transition
			hover:border-signal hover:text-signal disabled:opacity-40"
	>
		{#if tracker.isSaving}
			Sending…
		{:else if tracker.errorMessage !== null}
			Not sent — retry
		{:else if hasSent}
			Sent again
		{:else}
			Resend invite
		{/if}
	</button>
</form>
