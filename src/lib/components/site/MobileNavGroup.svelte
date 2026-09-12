<script lang="ts">
	import type { NavigationGroup } from './siteNavigation';

	let {
		group,
		onNavigate
	}: { group: NavigationGroup; onNavigate: () => void } = $props();
</script>

<div class="flex flex-col gap-1">
	<p class="px-3 pt-3 pb-1 font-display text-xs tracking-widest text-chalk/40 uppercase">
		{group.label}
	</p>
	{#each group.links as groupLink (groupLink.href)}
		<a
			href={groupLink.href}
			class="rounded-lg px-3 py-2 font-display text-sm text-chalk/80 transition
				hover:bg-night/60 hover:text-chalk"
			onclick={onNavigate}
		>
			{groupLink.label}
		</a>
	{/each}
</div>
