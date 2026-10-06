<script lang="ts">
	import type { BrainPageSummary } from '$lib/data/brainModelTypes';

	let {
		heading,
		pages,
		hrefFor
	}: { heading: string; pages: BrainPageSummary[]; hrefFor: (slug: string) => string } = $props();
</script>

{#if pages.length > 0}
	<section class="flex flex-col gap-2">
		<h2 class="font-mono text-[10px] tracking-widest text-chalk/40 uppercase">{heading}</h2>
		<ul class="flex flex-col gap-1">
			{#each pages as page (page.slug)}
				<li>
					<a
						href={hrefFor(page.slug)}
						title={page.summary}
						class="font-display text-sm text-chalk/80 underline decoration-hairline transition
							hover:text-chalk hover:decoration-chalk/40"
					>
						{page.title}
					</a>
				</li>
			{/each}
		</ul>
	</section>
{/if}
