<script lang="ts">
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { enhance } from '$app/forms';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import type { PayoutDetails } from '$lib/server/credits/payoutDetails';

	let { payoutDetails }: { payoutDetails: PayoutDetails | null } = $props();

	const tracker = new FormTracker();
	let isEditing = $state(false);

	const isFormOpen = $derived(isEditing || payoutDetails === null);

	const maskedAccountNumber = $derived(
		payoutDetails === null ? '' : `•••• ${payoutDetails.accountNumber.slice(-4)}`
	);
	const formattedSortCode = $derived(
		payoutDetails === null ? '' : payoutDetails.sortCode.replace(/(\d{2})(\d{2})(\d{2})/, '$1-$2-$3')
	);
</script>

<div class="flex flex-col gap-3 rounded-2xl border border-hairline bg-carriage p-6">
	<div class="flex flex-wrap items-center justify-between gap-4">
		<p class="font-display text-sm tracking-widest text-chalk/50 uppercase">Payout details</p>
		{#if payoutDetails !== null && !isFormOpen}
			<button
				type="button"
				onclick={() => (isEditing = true)}
				class="rounded-full border border-hairline px-4 py-1.5 font-display text-sm text-chalk/80
					transition hover:border-go hover:text-go"
			>
				Edit
			</button>
		{/if}
	</div>
	{#if payoutDetails !== null && !isFormOpen}
		<p class="text-sm text-chalk/80">
			{payoutDetails.accountHolder} · {formattedSortCode} · {maskedAccountNumber}
		</p>
		<p class="text-xs text-chalk/50">
			Your Trade Talk revenue share pays out here once Stripe payouts go live.
		</p>
	{:else}
		<p class="text-sm text-chalk/60">
			The account your Trade Talk revenue share pays out to once Stripe payouts go live. Your
			credits keep accruing either way.
		</p>
		<form
			method="POST"
			action="?/savePayoutDetails"
			use:enhance={tracker.submit(() => (isEditing = false))}
			class="flex flex-col gap-3"
		>
			<label class="flex flex-col gap-1">
				<span class="font-display text-xs tracking-widest text-chalk/50 uppercase">
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
					<span class="font-display text-xs tracking-widest text-chalk/50 uppercase">
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
					<span class="font-display text-xs tracking-widest text-chalk/50 uppercase">
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
	{/if}
</div>
