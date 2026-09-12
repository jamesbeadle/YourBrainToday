<script lang="ts">
	import { enhance } from '$app/forms';
	import { FormTracker } from '$lib/client/formTracker.svelte';

	let { memberId }: { memberId: string } = $props();

	const tracker = new FormTracker();
</script>

<form method="POST" action="?/removeMember" use:enhance={tracker.submit()}>
	<input type="hidden" name="memberId" value={memberId} />
	<button
		type="submit"
		disabled={tracker.isSaving}
		class="rounded-full border border-hairline px-3 py-1 text-xs text-chalk/60 transition
			hover:border-signal hover:text-signal disabled:opacity-40"
	>
		Remove
	</button>
</form>
