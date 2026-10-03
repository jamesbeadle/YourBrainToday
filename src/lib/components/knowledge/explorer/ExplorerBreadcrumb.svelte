<script lang="ts">
	export type Crumb = { label: string; href: string | null };

	let { crumbs }: { crumbs: Crumb[] } = $props();
</script>

<nav aria-label="Where this lives" class="flex flex-wrap items-center gap-1.5 font-display text-xs">
	{#each crumbs as crumb, index (index)}
		{#if index > 0}
			<span aria-hidden="true" class="text-chalk/30">›</span>
		{/if}
		{#if crumb.href === null}
			<span class={index === crumbs.length - 1 ? 'text-chalk' : 'text-chalk/60'}>
				{crumb.label}
			</span>
		{:else}
			<a href={crumb.href} class="text-chalk/60 transition hover:text-chalk">{crumb.label}</a>
		{/if}
	{/each}
</nav>
