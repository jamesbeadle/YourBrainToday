<script lang="ts">
	import type { TradeTalkEarnings } from '$lib/server/credits/getTradeTalkEarnings';

	let { earnings }: { earnings: TradeTalkEarnings } = $props();
</script>

<div class="flex flex-col gap-3 rounded-2xl border border-hairline bg-carriage p-6">
	<div class="flex flex-wrap items-center justify-between gap-4">
		<div>
			<p class="font-display text-sm tracking-widest text-chalk/50 uppercase">
				Trade Talk revenue share
			</p>
			<p class="font-display text-4xl font-medium">{earnings.totalCredits}</p>
			<p class="text-xs text-chalk/50">
				credits earned across {earnings.awardCount}
				{earnings.awardCount === 1 ? 'consultation' : 'consultations'}
			</p>
		</div>
		<a
			href="/trade-talk"
			class="rounded-full border border-hairline px-6 py-2.5 font-display text-sm text-chalk/80
				transition hover:border-go hover:text-go"
		>
			Open Trade Talk
		</a>
	</div>
	<p class="text-sm text-chalk/60">
		Every time a Trade Talk answer draws on a knowledge base you own, your share lands here as
		credits. Cash payouts arrive with our Stripe rollout — add your payout details below so
		you're ready on day one.
	</p>
</div>
