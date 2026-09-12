<script lang="ts">
	import { creditsPerTradeTalkQuestion } from '$lib/data/creditPricing';

	let { memberCount }: { memberCount: number } = $props();
</script>

<section class="mx-auto flex max-w-6xl flex-col gap-6 px-6 pt-20 pb-10">
	<p class="font-display text-sm tracking-widest text-signal uppercase">Trade Talk</p>
	<h1 class="max-w-3xl font-display text-4xl leading-tight font-medium md:text-5xl">
		Every trade. One answer.
	</h1>
	<p class="max-w-prose text-lg text-chalk/70">
		Trades that pass review put their second brains into the conversation — snapshots of what
		real businesses actually know. Ask one question and Trade Talk consults every trade that
		can help, tells you whose knowledge is speaking, and pays those trades for it.
	</p>
	<p class="font-display text-sm text-chalk/60">
		from {creditsPerTradeTalkQuestion} credits a question ·
		{memberCount === 1 ? '1 trade' : `${memberCount} trades`} talking
	</p>
</section>
