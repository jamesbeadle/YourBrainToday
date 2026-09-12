<script lang="ts">
	import ToolIcon from './ToolIcon.svelte';
	import { useDashboardTools } from './dashboardTools.svelte';
	import { brainsIconPaths } from './knowledgeBaseTools';
	import { knowledgeBaseHref } from '$lib/data/knowledge/knowledgeBaseRoutes';

	let {
		knowledgeBaseId,
		isOnConstellation,
		badgeCounts = {}
	}: {
		knowledgeBaseId: string;
		isOnConstellation: boolean;
		badgeCounts?: Record<string, number>;
	} = $props();

	const railTools = useDashboardTools().left;
	const brainsLabel = 'Brains';

	const railItemClass =
		'relative flex h-11 min-w-11 shrink-0 items-center justify-center rounded-xl transition lg:h-auto lg:min-w-0 lg:p-2.5';
	const activeItemClass = 'bg-hairline/60 text-signal';
	const restingItemClass = 'text-chalk/50 hover:bg-hairline/30 hover:text-chalk';

	function itemClass(isActive: boolean): string[] {
		return [railItemClass, isActive ? activeItemClass : restingItemClass];
	}
</script>

<nav
	aria-label="Knowledge base"
	class="order-last flex shrink-0 items-center justify-around overflow-x-auto border-t
		border-hairline bg-carriage/70 py-1.5 backdrop-blur scrollbar-hidden lg:order-none lg:w-14
		lg:flex-col lg:justify-start lg:gap-1.5 lg:overflow-visible lg:border-t-0 lg:border-r lg:py-3"
>
	<a
		href={knowledgeBaseHref(knowledgeBaseId)}
		title={brainsLabel}
		aria-label={brainsLabel}
		aria-current={isOnConstellation ? 'page' : undefined}
		class={itemClass(isOnConstellation)}
	>
		<ToolIcon iconPaths={brainsIconPaths} size={20} />
	</a>
	{#each railTools.tools as tool (tool.key)}
		<button
			type="button"
			title={tool.label}
			aria-label={tool.label}
			aria-pressed={railTools.activeKey === tool.key}
			onclick={() => railTools.toggle(tool.key)}
			class={itemClass(railTools.activeKey === tool.key)}
		>
			<ToolIcon iconPaths={tool.iconPaths} size={20} />
			{#if (badgeCounts[tool.key] ?? 0) > 0}
				<span
					class="absolute top-0.5 right-0.5 rounded-full bg-signal px-1 font-display text-[9px]
						font-medium text-night lg:-top-0.5 lg:-right-0.5"
				>
					{badgeCounts[tool.key]}
				</span>
			{/if}
		</button>
	{/each}
</nav>
