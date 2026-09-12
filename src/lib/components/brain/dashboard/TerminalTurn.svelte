<script lang="ts">
	import MarkdownBody from '../MarkdownBody.svelte';
	import type { BrainConversationMessage, BrainPageSummary } from '$lib/data/brainTypes';

	let {
		message,
		pageIndex,
		pageBasePath
	}: {
		message: BrainConversationMessage;
		pageIndex: BrainPageSummary[];
		pageBasePath: string;
	} = $props();

	function titleFor(slug: string): string {
		return pageIndex.find((page) => page.slug === slug)?.title ?? slug;
	}
</script>

{#if message.speaker === 'user'}
	<p class="text-chalk">
		<span class="text-signal select-none">❯</span>
		{message.body}
	</p>
{:else}
	<div class="flex flex-col gap-2 pl-4 text-chalk/75">
		<MarkdownBody markdown={message.body} />
		{#if message.citedSlugs.length > 0}
			<p class="flex flex-wrap gap-x-3 gap-y-1 text-xs">
				<span class="text-chalk/35 select-none">grounded in</span>
				{#each message.citedSlugs as slug (slug)}
					<a
						href={`${pageBasePath}/${slug}`}
						class="text-go/80 underline decoration-go/30 transition hover:text-go"
					>
						{titleFor(slug)}
					</a>
				{/each}
			</p>
		{/if}
	</div>
{/if}
