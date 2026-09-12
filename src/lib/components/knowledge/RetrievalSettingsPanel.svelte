<script lang="ts">
	import { enhance } from '$app/forms';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { retrievalPipelines } from '$lib/data/knowledge/retrievalPipelines';
	import type { RetrievalConfig } from '$lib/data/knowledge/knowledgeTypes';

	let {
		retrievalConfig,
		brainType,
		actionBasePath
	}: { retrievalConfig: RetrievalConfig; brainType: string; actionBasePath: string } = $props();

	const tracker = new FormTracker();

	let selectedPipeline = $derived(retrievalConfig.pipeline);

	const pipelineSummary = $derived(
		retrievalPipelines.find((definition) => definition.pipeline === selectedPipeline)?.summary ?? ''
	);

	const inputClasses = `rounded-xl border border-hairline bg-night px-3 py-2 text-sm text-chalk
		outline-none focus:border-signal`;
</script>

<form
	method="POST"
	action={`${actionBasePath}?/saveRetrieval`}
	use:enhance={tracker.submit()}
	class="flex flex-col gap-3"
>
	<input type="hidden" name="brainType" value={brainType} />
	<label class="flex flex-col gap-1">
		<span class="text-xs tracking-widest text-chalk/50 uppercase">Pipeline</span>
		<select name="pipeline" bind:value={selectedPipeline} class={inputClasses}>
			{#each retrievalPipelines as definition (definition.pipeline)}
				<option value={definition.pipeline}>{definition.label}</option>
			{/each}
		</select>
	</label>
	<p class="text-xs text-chalk/50">{pipelineSummary}</p>
	<div class="grid grid-cols-3 gap-3">
		<label class="flex flex-col gap-1">
			<span class="text-xs tracking-widest text-chalk/50 uppercase">Top K</span>
			<input type="number" name="topK" min="1" max="50" value={retrievalConfig.topK} class={inputClasses} />
		</label>
		<label class="flex flex-col gap-1">
			<span class="text-xs tracking-widest text-chalk/50 uppercase">Depth</span>
			<input
				type="number"
				name="traversalDepth"
				min="1"
				max="5"
				value={retrievalConfig.traversalDepth}
				class={inputClasses}
			/>
		</label>
		<label class="flex flex-col gap-1">
			<span class="text-xs tracking-widest text-chalk/50 uppercase">Recency</span>
			<input
				type="number"
				name="recencyWeight"
				min="0"
				max="1"
				step="0.1"
				value={retrievalConfig.recencyWeight}
				class={inputClasses}
			/>
		</label>
	</div>
	<SubmitButton
		isSaving={tracker.isSaving}
		savingLabel="Saving…"
		class="self-end rounded-full border border-hairline px-5 py-2 font-display text-sm
			text-chalk/80 transition hover:border-signal hover:text-signal"
	>
		Save retrieval settings
	</SubmitButton>
</form>
