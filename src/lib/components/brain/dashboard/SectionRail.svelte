<script lang="ts">
	import { sectionIconPaths, sectionLabels, type SectionKey } from './railIcons';

	let {
		sections,
		activeSection,
		badgeCounts = {},
		onSelect
	}: {
		sections: SectionKey[];
		activeSection: SectionKey | null;
		badgeCounts?: Partial<Record<SectionKey, number>>;
		onSelect: (section: SectionKey) => void;
	} = $props();
</script>

<nav
	class="flex shrink-0 items-center justify-around border-t border-hairline bg-carriage/70
		py-1.5 backdrop-blur lg:w-14 lg:flex-col lg:justify-start lg:gap-1.5 lg:border-t-0
		lg:border-r lg:py-3"
>
	{#each sections as section (section)}
		<button
			type="button"
			title={sectionLabels[section]}
			aria-label={sectionLabels[section]}
			aria-pressed={activeSection === section}
			onclick={() => onSelect(section)}
			class={`relative rounded-xl p-2.5 transition ${
				activeSection === section
					? 'bg-hairline/60 text-signal'
					: 'text-chalk/50 hover:bg-hairline/30 hover:text-chalk'
			}`}
		>
			<svg
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="1.7"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				{#each sectionIconPaths[section] as pathData (pathData)}
					<path d={pathData} />
				{/each}
			</svg>
			{#if (badgeCounts[section] ?? 0) > 0}
				<span
					class="absolute -top-0.5 -right-0.5 rounded-full bg-signal px-1 font-display
						text-[9px] font-medium text-night"
				>
					{badgeCounts[section]}
				</span>
			{/if}
		</button>
	{/each}
</nav>
