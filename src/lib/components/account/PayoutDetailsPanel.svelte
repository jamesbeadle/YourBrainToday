<script lang="ts">
	import PayoutDetailsForm from './PayoutDetailsForm.svelte';
	import type { PayoutDetails } from '$lib/server/credits/payoutDetails';

	let { payoutDetails }: { payoutDetails: PayoutDetails | null } = $props();

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
		<p class="font-mono text-sm tracking-widest text-chalk/50 uppercase">Payout details</p>
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
		<PayoutDetailsForm {payoutDetails} onSaved={() => (isEditing = false)} />
	{/if}
</div>
