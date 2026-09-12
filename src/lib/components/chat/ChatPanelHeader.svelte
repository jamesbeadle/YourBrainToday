<script lang="ts">
	import BrandMark from '../site/BrandMark.svelte';

	let { projectName, onClose }: { projectName: string; onClose: () => void } = $props();
</script>

<header class="flex items-center justify-between gap-3 border-b border-hairline bg-night px-4 py-3">
	<div class="flex items-center gap-3">
		<BrandMark size={26} />
		<div>
			<p class="font-display text-sm">The Agent</p>
			<p class="text-xs text-chalk/60">{projectName}</p>
		</div>
	</div>
	<button
		type="button"
		aria-label="Close the agent chat"
		class="font-display text-xl leading-none text-chalk/70 hover:text-signal"
		onclick={onClose}
	>
		×
	</button>
</header>
