<script lang="ts">
	let { onOpen }: { onOpen: () => void } = $props();
</script>

<button
	type="button"
	aria-label="Open menu"
	class="text-chalk/80 transition hover:text-chalk"
	onclick={onOpen}
>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="1.5"
		stroke-linecap="round"
		stroke-linejoin="round"
		class="h-6 w-6"
		aria-hidden="true"
	>
		<path d="M4 6h16" />
		<path d="M4 12h16" />
		<path d="M4 18h16" />
	</svg>
</button>
