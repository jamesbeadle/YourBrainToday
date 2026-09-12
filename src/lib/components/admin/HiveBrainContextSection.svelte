<script lang="ts">
	import HiveBrainPageCard from './HiveBrainPageCard.svelte';
	import type {
		HiveApplicationContext,
		HiveApplicationPage
	} from '$lib/server/hive/hiveApplicationBrain';

	let {
		context,
		pages
	}: { context: HiveApplicationContext; pages: HiveApplicationPage[] } = $props();
</script>

<section class="flex flex-col gap-3">
	<div class="flex flex-col gap-1">
		<div class="flex flex-wrap items-baseline gap-2">
			<h2 class="font-display text-xl font-medium">{context.name}</h2>
			{#if context.isCoreDomain}
				<span class="rounded-full border border-signal/60 px-3 py-0.5 font-display text-xs text-signal">
					Core domain
				</span>
			{/if}
		</div>
		{#if context.summary !== ''}
			<p class="text-sm text-chalk/60">{context.summary}</p>
		{/if}
	</div>
	{#if pages.length === 0}
		<p class="rounded-2xl border border-dashed border-hairline p-4 text-sm text-chalk/50">
			No pages in this context yet.
		</p>
	{:else}
		<ul class="flex flex-col gap-3">
			{#each pages as page (page.slug)}
				<HiveBrainPageCard {page} />
			{/each}
		</ul>
	{/if}
</section>
