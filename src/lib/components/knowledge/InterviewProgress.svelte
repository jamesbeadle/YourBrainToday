<script lang="ts">
	import {
		completePhase,
		interviewPhaseDescriptions,
		lastPhaseStep,
		phaseStepOf,
		type InterviewPhase
	} from '$lib/data/knowledge/interviewPhases';

	let { phase }: { phase: InterviewPhase } = $props();

	const isComplete = $derived(phase === completePhase);
	const stepLabel = $derived(`Process map · ${phase} · step ${phaseStepOf(phase)} of ${lastPhaseStep}`);
</script>

<div class="flex items-baseline justify-between gap-3 border-b border-hairline px-4 py-2 text-xs">
	<span class={isComplete ? 'font-medium text-signal' : 'font-medium text-chalk/80'}>
		{isComplete ? 'Process map complete — nothing left to ask' : stepLabel}
	</span>
	<span class="truncate text-chalk/50">{interviewPhaseDescriptions[phase]}</span>
</div>
