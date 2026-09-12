<script lang="ts">
	import { hiveMindEarningsPool } from '$lib/data/creditPricing';

	const steps = [
		{
			title: 'Apply from your knowledge base',
			detail:
				'Open your knowledge base, find Trade Talk, say what your trade can advise on, and submit it for review.'
		},
		{
			title: 'Pass review, join as a snapshot',
			detail:
				'The Your Brain Today team reviews every application. Approval freezes a snapshot of your knowledge — Trade Talk answers from the snapshot, never your live brain, and you can re-apply any time to refresh it.'
		},
		{
			title: 'Earn a revenue share when consulted',
			detail:
				`From every question, ${hiveMindEarningsPool} credits are shared among the trades whose brains shaped the answer — a revenue share paid onto your credit balance, in proportion to how much of your knowledge was used. Your running total lives in your account.`
		}
	];
</script>

<section class="mx-auto max-w-6xl px-6 py-16">
	<div class="flex flex-col gap-2">
		<h2 class="font-display text-3xl font-medium">Put your trade in the conversation</h2>
		<p class="max-w-prose text-chalk/70">
			A business directory tells people you exist. Trade Talk lets them draw on what you know —
			and pays you for having articulated it.
		</p>
	</div>
	<div class="mt-10 grid gap-6 md:grid-cols-3">
		{#each steps as step, stepIndex (step.title)}
			<article class="flex flex-col gap-3 rounded-2xl border border-hairline bg-carriage p-6">
				<span class="font-display text-sm text-signal">{stepIndex + 1}</span>
				<h3 class="font-display text-lg font-medium">{step.title}</h3>
				<p class="text-sm text-chalk/70">{step.detail}</p>
			</article>
		{/each}
	</div>
	<a
		href="/knowledge-base"
		class="mt-8 inline-block rounded-full bg-signal px-7 py-3 font-display text-sm font-medium
			text-night transition hover:brightness-110"
	>
		Open your knowledge base
	</a>
</section>
