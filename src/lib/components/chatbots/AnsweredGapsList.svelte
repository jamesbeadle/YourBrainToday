<script lang="ts">
	import { answeredLineFor } from './knowledgeGapAskingLine';
	import type { KnowledgeGap } from '$lib/data/chatbotTypes';

	let { gaps }: { gaps: KnowledgeGap[] } = $props();

	const summaryLabel = $derived(
		gaps.length === 1 ? 'Taught 1 answer recently' : `Taught ${gaps.length} answers recently`
	);
</script>

{#if gaps.length > 0}
	<details class="border-t border-hairline pt-4">
		<summary class="cursor-pointer text-sm text-chalk/60 transition hover:text-chalk">
			{summaryLabel}
		</summary>
		<ul class="mt-3 flex flex-col divide-y divide-hairline text-sm">
			{#each gaps as gap (gap.id)}
				<li class="flex flex-col gap-1 py-2">
					<p class="text-chalk">“{gap.question}”</p>
					<p class="line-clamp-2 text-chalk/60">{gap.answer}</p>
					<p class="text-xs text-chalk/40">{answeredLineFor(gap)}</p>
				</li>
			{/each}
		</ul>
	</details>
{/if}
