<script lang="ts">
	import { sectionLabels, type SectionKey } from './railIcons';
	import type { Snippet } from 'svelte';

	let {
		section,
		onClose,
		children
	}: { section: SectionKey; onClose: () => void; children: Snippet } = $props();
</script>

<aside
	class="absolute inset-0 z-30 flex flex-col bg-night lg:static lg:inset-auto lg:z-auto
		lg:w-[380px] lg:shrink-0 lg:border-r lg:border-hairline"
>
	<header class="flex items-center justify-between border-b border-hairline px-4 py-2.5">
		<h2 class="font-display text-xs tracking-widest text-chalk/60 uppercase">
			{sectionLabels[section]}
		</h2>
		<button
			type="button"
			onclick={onClose}
			aria-label="Close panel"
			class="rounded-full px-2 py-0.5 font-display text-sm text-chalk/50 transition
				hover:bg-hairline/40 hover:text-chalk"
		>
			✕
		</button>
	</header>
	<div class="flex min-h-0 flex-1 flex-col overflow-hidden">
		{@render children()}
	</div>
</aside>
