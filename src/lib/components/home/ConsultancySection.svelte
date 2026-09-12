<script lang="ts">
	import ConsultancyStepCard from './ConsultancyStepCard.svelte';
	import { consultancySteps } from '$lib/data/consultancySteps';
</script>

<section class="border-y border-hairline bg-carriage/60">
	<div class="mx-auto max-w-6xl px-6 py-16">
		<div class="flex flex-col gap-2">
			<p class="font-display text-sm tracking-widest text-signal uppercase">The consultancy</p>
			<h2 class="font-display text-3xl font-medium">How the consultancy works</h2>
			<p class="max-w-prose text-chalk/70">
				We come in, learn how the business really runs, and automate it. No software to adopt
				first, no data entry — the first thing we do is listen.
			</p>
		</div>
		<div class="mt-10 grid gap-6 md:grid-cols-3">
			{#each consultancySteps as step, index (step.id)}
				<ConsultancyStepCard {step} stepNumber={index + 1} />
			{/each}
		</div>
		<a
			href="/contact"
			class="mt-8 inline-block rounded-full border border-signal/60 px-6 py-2.5 font-display text-sm
				text-signal transition hover:bg-signal hover:text-night"
		>
			Tell us what you would like to automate
		</a>
	</div>
</section>
