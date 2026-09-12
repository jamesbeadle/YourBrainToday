<script lang="ts">
	let {
		brainId,
		backHref,
		backLabel,
		isOwner
	}: { brainId: string; backHref: string; backLabel: string; isOwner: boolean } = $props();
</script>

<div
	class="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-center
		justify-between px-4 py-2"
>
	<a
		href={backHref}
		class="pointer-events-auto font-display text-xs text-chalk/50 transition hover:text-chalk"
	>
		← {backLabel}
	</a>
	{#if isOwner}
		<a
			href={`/api/brain/export?brain=${brainId}`}
			download
			class="pointer-events-auto font-display text-xs text-chalk/50 underline transition
				hover:text-chalk"
		>
			Export as Markdown
		</a>
	{/if}
</div>
