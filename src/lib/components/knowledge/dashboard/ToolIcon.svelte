<script lang="ts">
	let { iconPaths, size = 18 }: { iconPaths: string[]; size?: number } = $props();
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="1.7"
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden="true"
>
	{#each iconPaths as pathData (pathData)}
		<path d={pathData} />
	{/each}
</svg>
