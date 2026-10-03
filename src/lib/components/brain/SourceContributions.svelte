<script lang="ts">
	import { describeCount, progressCounts } from './readingProgressSummary';
	import { fetchSourceContributions, type SourceContributions } from './fetchSourceContributions';

	let { sourceId, pageBasePath }: { sourceId: string; pageBasePath: string } = $props();

	let contributions = $state<SourceContributions | null>(null);
	let isLoading = $state(false);
	let hasFailed = $state(false);

	async function loadWhenOpened(event: Event) {
		const details = event.currentTarget as HTMLDetailsElement;
		if (!details.open || contributions !== null || isLoading) return;
		isLoading = true;
		contributions = await fetchSourceContributions(sourceId);
		hasFailed = contributions === null;
		isLoading = false;
	}
</script>

<details ontoggle={loadWhenOpened} class="mt-1 text-xs">
	<summary class="cursor-pointer font-display text-chalk/50 transition hover:text-chalk">
		What it added
	</summary>
	{#if isLoading}
		<p class="mt-1 animate-pulse text-chalk/50">Looking it up…</p>
	{:else if hasFailed}
		<p class="mt-1 text-caution">Could not load what this document added.</p>
	{:else if contributions !== null}
		<ul class="mt-1 flex flex-wrap gap-x-3 text-chalk/70">
			{#each progressCounts(contributions.progress) as entry (entry.many)}
				<li>{describeCount(entry)}</li>
			{/each}
		</ul>
		{#if contributions.pageSlugs.length > 0}
			<ul class="mt-1 flex flex-wrap gap-x-3 gap-y-1">
				{#each contributions.pageSlugs as slug (slug)}
					<li>
						<a href={`${pageBasePath}/${slug}`} class="text-chalk/80 underline transition hover:text-chalk">
							{slug}
						</a>
					</li>
				{/each}
			</ul>
		{/if}
	{/if}
</details>
