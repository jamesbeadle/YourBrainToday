<script lang="ts">
	let { title, onClose }: { title: string; onClose: () => void } = $props();
</script>

<header class="flex shrink-0 items-center justify-between border-b border-hairline px-4 py-2.5">
	<h2 class="font-display text-xs tracking-widest text-chalk/60 uppercase">{title}</h2>
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
