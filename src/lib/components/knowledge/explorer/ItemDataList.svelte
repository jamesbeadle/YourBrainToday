<script lang="ts">
	import { dataFieldsOf, provenanceOf } from './itemDataFields';
	import type { KbBrainItem } from '$lib/data/knowledge/knowledgeTypes';

	let { item }: { item: KbBrainItem } = $props();

	const fields = $derived(dataFieldsOf(item));
	const provenance = $derived(provenanceOf(item));
</script>

{#if provenance !== ''}
	<p class="font-display text-xs text-chalk/50">From: {provenance}</p>
{/if}
{#if fields.length > 0}
	<dl class="flex flex-col gap-1.5 text-sm">
		{#each fields as field (field.label)}
			<div class="flex gap-3">
				<dt class="w-28 shrink-0 font-mono text-[10px] leading-5 tracking-widest text-chalk/40 uppercase">
					{field.label}
				</dt>
				<dd class="min-w-0 whitespace-pre-line text-chalk/80">{field.value}</dd>
			</div>
		{/each}
	</dl>
{/if}
