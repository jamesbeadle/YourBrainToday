<script lang="ts">
	import type { ConsultancyStep } from '$lib/data/consultancySteps';

	let { step, stepNumber }: { step: ConsultancyStep; stepNumber: number } = $props();
</script>

<article class="flex flex-col gap-3 rounded-2xl border border-hairline bg-night p-6">
	<div class="flex items-center gap-3">
		<span class={`h-2 w-2 shrink-0 rounded-full ${step.accentClass}`}></span>
		<span class="font-display text-xs tracking-widest text-chalk/50 uppercase">
			Step {stepNumber}
		</span>
	</div>
	<h3 class="font-display text-xl font-medium">{step.name}</h3>
	<p class="text-sm text-chalk/70">{step.description}</p>
</article>
