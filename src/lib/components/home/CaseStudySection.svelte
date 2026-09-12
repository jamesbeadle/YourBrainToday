<script lang="ts">
	import { jewelBespokeBuildCaseStudy } from '$lib/data/caseStudies';

	const caseStudy = jewelBespokeBuildCaseStudy;
</script>

<section class="mx-auto max-w-6xl px-6 py-16">
	<div class="grid items-center gap-10 md:grid-cols-2">
		<div class="flex flex-col gap-4">
			<p class="font-display text-sm tracking-widest text-signal uppercase">Case study</p>
			<h2 class="font-display text-3xl font-medium">{caseStudy.clientName}</h2>
			<p class="font-display text-sm text-chalk/50">{caseStudy.clientDescription}</p>
			<p class="max-w-prose text-chalk/70">{caseStudy.summary}</p>
			<a
				href="/contact"
				class="self-start rounded-full border border-signal/60 px-6 py-2.5 font-display text-sm
					text-signal transition hover:bg-signal hover:text-night"
			>
				Talk to us about your business
			</a>
		</div>
		<div class="flex flex-col gap-3 rounded-2xl border border-hairline bg-carriage p-8">
			<p class="font-display text-sm tracking-widest text-chalk/50 uppercase">What we built</p>
			<ul class="flex flex-col gap-4">
				{#each caseStudy.deliveries as delivery (delivery.name)}
					<li class="flex items-start gap-3 text-sm text-chalk/80">
						<span class="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-go"></span>
						<span>
							<span class="font-display text-chalk">{delivery.name}.</span>
							{delivery.description}
						</span>
					</li>
				{/each}
			</ul>
		</div>
	</div>
</section>
