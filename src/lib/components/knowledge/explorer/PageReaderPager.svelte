<script lang="ts">
	import type { BrainPageSummary } from '$lib/data/brainTypes';

	let {
		previous,
		next,
		hrefFor
	}: {
		previous: BrainPageSummary | null;
		next: BrainPageSummary | null;
		hrefFor: (slug: string) => string;
	} = $props();

	const pagerLinkClass =
		'flex min-w-0 flex-col gap-0.5 rounded-xl border border-hairline px-4 py-3 font-display transition hover:border-chalk/40';
</script>

{#if previous !== null || next !== null}
	<nav aria-label="Read on" class="grid gap-3 border-t border-hairline pt-6 sm:grid-cols-2">
		{#if previous !== null}
			<a href={hrefFor(previous.slug)} class={pagerLinkClass}>
				<span class="text-[10px] tracking-widest text-chalk/40 uppercase">← Previous</span>
				<span class="truncate text-sm text-chalk">{previous.title}</span>
			</a>
		{:else}
			<span></span>
		{/if}
		{#if next !== null}
			<a href={hrefFor(next.slug)} class={[pagerLinkClass, 'text-right']}>
				<span class="text-[10px] tracking-widest text-chalk/40 uppercase">Next →</span>
				<span class="truncate text-sm text-chalk">{next.title}</span>
			</a>
		{/if}
	</nav>
{/if}
