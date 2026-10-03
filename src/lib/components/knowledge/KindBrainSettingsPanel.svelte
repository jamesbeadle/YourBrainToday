<script lang="ts">
	import BindingsPanel from './BindingsPanel.svelte';
	import DangerConfirmModal from '$lib/components/site/DangerConfirmModal.svelte';
	import HowBrainIsRead from './HowBrainIsRead.svelte';
	import { findBrainType } from '$lib/data/knowledge/brainTypeCatalog';
	import { kindForCategory } from '$lib/data/knowledge/knowledgeKinds';
	import type { KbBrainSummary } from '$lib/data/knowledge/knowledgeTypes';

	let {
		brain,
		domainBrains,
		boundDomainBrainIds,
		isOwner,
		actionBasePath
	}: {
		brain: KbBrainSummary;
		domainBrains: KbBrainSummary[];
		boundDomainBrainIds: string[];
		isOwner: boolean;
		actionBasePath: string;
	} = $props();

	let isDeleteModalOpen = $state(false);

	const kind = $derived(kindForCategory(brain.category));
	const definition = $derived(findBrainType(brain.brainType));
</script>

<div class="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-4">
	<section class="flex flex-col gap-1">
		<h3 class="font-display text-lg font-medium">{brain.name}</h3>
		<span
			class="w-fit rounded-full border px-2.5 py-0.5 text-xs"
			style={`border-color: ${kind.accent}66; color: ${kind.accent}`}
		>
			{kind.label} · {definition?.label ?? brain.brainType}
		</span>
		{#if brain.description !== ''}
			<p class="pt-1 text-sm text-chalk/60">{brain.description}</p>
		{/if}
	</section>
	{#if brain.category === 'instance'}
		<section class="flex flex-col gap-3">
			<h4 class="font-mono text-xs tracking-widest text-chalk/50 uppercase">
				Expertise bindings
			</h4>
			<BindingsPanel {domainBrains} {boundDomainBrainIds} {actionBasePath} />
		</section>
	{/if}
	<section class="flex flex-col gap-2">
		<h4 class="font-mono text-xs tracking-widest text-chalk/50 uppercase">How it is read</h4>
		<HowBrainIsRead category={brain.category} />
	</section>
	{#if isOwner}
		<section class="flex flex-col items-start gap-2 border-t border-hairline pt-4">
			<button
				type="button"
				onclick={() => (isDeleteModalOpen = true)}
				class="rounded-full border border-hairline px-4 py-2 text-sm text-chalk/60 transition
					hover:border-signal hover:text-signal"
			>
				Delete brain
			</button>
		</section>
	{/if}
</div>

<DangerConfirmModal
	bind:isOpen={isDeleteModalOpen}
	title="Delete this brain?"
	description={`"${brain.name}" and everything stored in it will be removed from this knowledge base.`}
	action={`${actionBasePath}?/deleteBrain`}
	fields={{}}
	submitLabel="Delete brain"
/>
