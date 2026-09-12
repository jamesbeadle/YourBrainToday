<script lang="ts">
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { enhance } from '$app/forms';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { siteModelChoices } from '$lib/data/siteModels';
	import type { AdminUserSummary } from '$lib/server/admin/getAdminUserList';

	let { user }: { user: AdminUserSummary } = $props();

	const tracker = new FormTracker();
</script>

<form
	method="POST"
	action="?/setUserModel"
	use:enhance={tracker.submit()}
	class="flex items-center gap-2"
>
	<input type="hidden" name="targetEmail" value={user.email} />
	<select
		name="modelId"
		value={user.modelOverride ?? ''}
		aria-label={`Model for ${user.email}`}
		class="rounded-full border px-3 py-1 text-xs outline-none focus:border-go
			{user.modelOverride === null
			? 'border-hairline bg-night text-chalk/60'
			: 'border-go/50 bg-night text-go'}"
	>
		<option value="">Site default</option>
		{#each siteModelChoices as choice (choice.modelId)}
			<option value={choice.modelId}>{choice.modelId}</option>
		{/each}
	</select>
	<SubmitButton
		isSaving={tracker.isSaving}
		savingLabel="…"
		class="rounded-full border border-hairline px-3 py-1 font-display text-xs text-chalk/60
			transition hover:border-go hover:text-go"
	>
		Set
	</SubmitButton>
</form>
