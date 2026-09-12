<script lang="ts">
	import { enhance } from '$app/forms';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { creditAdjustmentLimit } from '$lib/data/creditAdjustments';
	import type { AdminUserSummary } from '$lib/server/admin/getAdminUserList';

	let { user, onClose }: { user: AdminUserSummary; onClose: () => void } = $props();

	const tracker = new FormTracker();
	const fieldClasses = `rounded-full border border-hairline bg-night px-4 py-2 text-chalk
		outline-none focus:border-go`;

	let dialogElement: HTMLDialogElement | undefined = $state();

	$effect(() => {
		dialogElement?.showModal();
	});
</script>

<dialog
	bind:this={dialogElement}
	onclose={onClose}
	class="m-auto w-full max-w-sm rounded-2xl border border-hairline bg-night p-6 text-chalk
		backdrop:bg-night/80"
>
	<form
		method="POST"
		action="?/adjustCredits"
		use:enhance={tracker.submit(onClose)}
		class="flex flex-col gap-5"
	>
		<div class="flex flex-col gap-1">
			<h2 class="font-display text-lg font-medium">Adjust credits</h2>
			<p class="text-sm text-chalk/60">
				{user.email} — currently {user.credits} credits. Negative takes credits away.
			</p>
		</div>
		<input type="hidden" name="targetEmail" value={user.email} />
		<label class="flex flex-col gap-2 text-sm text-chalk/70">
			Credits to add or remove
			<input
				name="creditDelta"
				type="number"
				min={-creditAdjustmentLimit}
				max={creditAdjustmentLimit}
				value="1000"
				required
				class={fieldClasses}
			/>
		</label>
		<label class="flex flex-col gap-2 text-sm text-chalk/70">
			Why
			<input
				name="note"
				placeholder="promo, goodwill, partial refund…"
				required
				class={fieldClasses}
			/>
		</label>
		<FormErrorNote message={tracker.errorMessage} />
		<div class="flex justify-end gap-3">
			<button
				type="button"
				onclick={() => dialogElement?.close()}
				class="rounded-full border border-hairline px-4 py-1.5 font-display text-sm text-chalk/70
					transition hover:border-chalk/40 hover:text-chalk"
			>
				Cancel
			</button>
			<SubmitButton
				isSaving={tracker.isSaving}
				savingLabel="Adjusting…"
				class="rounded-full border border-go/60 px-4 py-1.5 font-display text-sm text-go
					transition hover:bg-go hover:text-night"
			>
				Adjust
			</SubmitButton>
		</div>
	</form>
</dialog>
