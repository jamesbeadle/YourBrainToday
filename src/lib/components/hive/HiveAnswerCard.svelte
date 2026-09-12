<script lang="ts">
	import MarkdownBody from '../brain/MarkdownBody.svelte';
	import type { HiveAnswer } from '$lib/data/hiveTypes';

	let { question, answer }: { question: string; answer: HiveAnswer } = $props();
</script>

<div class="flex flex-col gap-4 rounded-2xl border border-hairline bg-night p-6">
	<p class="font-display text-sm text-signal">{question}</p>
	<MarkdownBody markdown={answer.answerMarkdown} />
	{#if answer.contributors.length > 0}
		<div class="flex flex-wrap items-center gap-2 border-t border-hairline pt-4">
			<span class="font-display text-xs tracking-widest text-chalk/50 uppercase">Drew on</span>
			{#each answer.contributors as contributor, contributorIndex (contributorIndex)}
				<span
					class="rounded-full border border-go/60 px-3 py-1 font-display text-xs text-go"
				>
					{contributor.specialtyName} · {contributor.pagesRead}
					{contributor.pagesRead === 1 ? 'page' : 'pages'}
				</span>
			{/each}
		</div>
	{/if}
</div>
