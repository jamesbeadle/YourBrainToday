<script lang="ts">
	export type ItemLink = { label: string; href: string | null; detail?: string };

	let { heading, links }: { heading: string; links: ItemLink[] } = $props();

	const linkClass =
		'font-display text-sm text-chalk/80 underline decoration-hairline transition hover:text-chalk hover:decoration-chalk/40';
</script>

{#if links.length > 0}
	<section class="flex flex-col gap-2">
		<h2 class="font-mono text-[10px] tracking-widest text-chalk/40 uppercase">{heading}</h2>
		<ul class="flex flex-col gap-1">
			{#each links as link, index (index)}
				<li class="flex flex-wrap items-baseline gap-x-2">
					{#if link.href === null}
						<span class="font-display text-sm text-chalk/80">{link.label}</span>
					{:else}
						<a href={link.href} class={linkClass}>{link.label}</a>
					{/if}
					{#if link.detail !== undefined && link.detail !== ''}
						<span class="text-xs text-chalk/40">{link.detail}</span>
					{/if}
				</li>
			{/each}
		</ul>
	</section>
{/if}
