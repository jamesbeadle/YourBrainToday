<script lang="ts">
	let { title, items }: { title: string; items: string[] } = $props();
</script>

<div>
	<h3 class="font-display text-xs tracking-widest text-chalk/50 uppercase">{title}</h3>
	<ul class="mt-1.5 flex flex-col gap-1">
		{#each items as item}
			<li class="flex items-center gap-2 text-sm">
				<span class="h-1.5 w-1.5 shrink-0 rounded-full bg-chalk/50"></span>
				{item}
			</li>
		{/each}
	</ul>
</div>
