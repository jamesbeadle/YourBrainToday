<script lang="ts">
	import { enhance } from '$app/forms';
	import { modelLadder } from '$lib/data/modelLadder';
	import { FormTracker } from '$lib/client/formTracker.svelte';

	let { memberId, modelId }: { memberId: string; modelId: string | null } = $props();

	const tracker = new FormTracker();
	let formElement = $state<HTMLFormElement | null>(null);
</script>

<form
	bind:this={formElement}
	method="POST"
	action="?/setMemberModel"
	use:enhance={tracker.submit()}
	class="inline-flex"
>
	<input type="hidden" name="memberId" value={memberId} />
	<select
		name="modelId"
		value={modelId ?? ''}
		disabled={tracker.isSaving}
		aria-label="Model for this member"
		onchange={() => formElement?.requestSubmit()}
		class="rounded-lg border border-hairline bg-night px-2 py-1 text-xs text-chalk outline-none
			focus:border-signal disabled:opacity-40"
	>
		<option value="">Bot default</option>
		{#each modelLadder as rung (rung.modelId)}
			<option value={rung.modelId}>{rung.name} · from {rung.floorCredits}</option>
		{/each}
	</select>
</form>
