<script lang="ts">
	import type { CheckoutOutcome } from '$lib/server/payments/reconcileCheckoutReturn';

	let { outcome }: { outcome: CheckoutOutcome } = $props();
</script>

{#if outcome === 'credited'}
	<p class="rounded-2xl border border-go/50 bg-go/10 px-5 py-4 text-go">
		Payment received — your credits are in the ledger and ready to spend.
	</p>
{/if}
{#if outcome === 'pending'}
	<p class="rounded-2xl border border-caution/50 bg-caution/10 px-5 py-4 text-caution">
		Payment received — your credits land in the ledger as soon as Stripe confirms it. Card
		payments settle within seconds; bank payments can take a few days. Refresh if your balance
		hasn't moved yet.
	</p>
{/if}
{#if outcome === 'cancelled'}
	<p class="rounded-2xl border border-hairline bg-carriage px-5 py-4 text-chalk/70">
		Checkout cancelled — no card was charged.
	</p>
{/if}
