<script lang="ts">
	import ToolIcon from './ToolIcon.svelte';
	import type { DashboardTool } from './dashboardTools.svelte';

	let {
		tools,
		activeKey,
		onSelect
	}: {
		tools: DashboardTool[];
		activeKey: string | null;
		onSelect: (key: string) => void;
	} = $props();

	const toolbarWidthShareOnPhones = 'max-w-[62%] lg:max-w-none';
	const touchTargetClass = 'h-11 min-w-11 lg:h-auto lg:min-w-0 lg:py-2';
</script>

<nav
	aria-label="Brain tools"
	class={[
		'pointer-events-auto flex shrink-0 items-center gap-0.5 overflow-x-auto rounded-2xl border',
		'border-hairline bg-night/80 p-1 backdrop-blur-sm scrollbar-hidden',
		toolbarWidthShareOnPhones
	]}
>
	{#each tools as tool (tool.key)}
		<button
			type="button"
			title={tool.label}
			aria-label={tool.label}
			aria-pressed={activeKey === tool.key}
			onclick={() => onSelect(tool.key)}
			class={[
				'relative flex shrink-0 items-center justify-center gap-1.5 rounded-xl px-2.5 transition lg:px-3',
				touchTargetClass,
				activeKey === tool.key
					? 'bg-hairline/60 text-signal'
					: 'text-chalk/50 hover:bg-hairline/30 hover:text-chalk'
			]}
		>
			<ToolIcon iconPaths={tool.iconPaths} />
			{#if activeKey === tool.key}
				<span class="hidden font-display text-xs lg:inline">{tool.label}</span>
			{/if}
		</button>
	{/each}
</nav>
