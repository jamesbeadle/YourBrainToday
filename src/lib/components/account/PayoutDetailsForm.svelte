<script lang="ts">
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { enhance } from '$app/forms';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import type { PayoutDetails } from '$lib/server/credits/payoutDetails';

	let { payoutDetails, onSaved }: { payoutDetails: PayoutDetails | null; onSaved: () => void } =
		$props();

	const tracker = new FormTracker();
</script>

<form
	method="POST"
	action="?/savePayoutDetails"
	use:enhance={tracker.submit(onSaved)}
	class="flex flex-col gap-3"
>
	<label class="flex flex-col gap-1">
		<span class="font-mono text-xs tracking-widest text-chalk/50 uppercase">
			Account holder
		</span>
		<input
			name="accountHolder"
			required
			value={payoutDetails?.accountHolder ?? ''}
			placeholder="Jewel Bespoke Build Ltd"
			class="rounded-xl border border-hairline bg-night px-4 py-2.5 text-chalk outline-none
				focus:border-signal"
		/>
	</label>
	<div class="flex flex-wrap gap-3">
		<label class="flex min-w-32 flex-1 flex-col gap-1">
			<span class="font-mono text-xs tracking-widest text-chalk/50 uppercase">
				Sort code
			</span>
			<input
				name="sortCode"
				required
				inputmode="numeric"
				value={payoutDetails?.sortCode ?? ''}
				placeholder="60-83-71"
				class="rounded-xl border border-hairline bg-night px-4 py-2.5 text-chalk outline-none
					focus:border-signal"
			/>
		</label>
		<label class="flex min-w-40 flex-1 flex-col gap-1">
			<span class="font-mono text-xs tracking-widest text-chalk/50 uppercase">
				Account number
			</span>
			<input
				name="accountNumber"
				required
				inputmode="numeric"
				value={payoutDetails?.accountNumber ?? ''}
				placeholder="12345678"
				class="rounded-xl border border-hairline bg-night px-4 py-2.5 text-chalk outline-none
					focus:border-signal"
			/>
		</label>
	</div>
	<FormErrorNote message={tracker.errorMessage} />
	<SubmitButton
		isSaving={tracker.isSaving}
		savingLabel="Saving…"
		class="self-end rounded-full bg-go px-6 py-2.5 font-display text-sm font-medium text-night
			transition hover:brightness-110"
	>
		Save payout details
	</SubmitButton>
</form>
