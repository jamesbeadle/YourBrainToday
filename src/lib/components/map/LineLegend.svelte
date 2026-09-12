<script lang="ts">
	import type { RoleLine } from '$lib/data/types';

	let { lines }: { lines: RoleLine[] } = $props();
</script>

<div class="flex flex-wrap items-center gap-x-8 gap-y-3">
	<ul class="flex flex-wrap gap-x-8 gap-y-2">
		{#each lines as line (line.id)}
			<li class="flex items-center gap-2">
				<span class="h-2.5 w-9 rounded-full" style={`background-color: ${line.colour}`}></span>
				<span class="font-display text-sm tracking-wide">{line.role}</span>
			</li>
		{/each}
	</ul>
	<ul class="flex flex-wrap gap-x-6 gap-y-2 border-l border-hairline pl-6">
		<li class="flex items-center gap-2">
			<span class="h-4 w-4 rounded-full border-4 border-chalk bg-night"></span>
			<span class="text-sm text-chalk/70">Interchange — workflows meet</span>
		</li>
		<li class="flex items-center gap-2">
			<span class="flex h-5 w-5 items-center justify-center rounded-full bg-tube-circle">
				<span class="h-3 w-3 rounded-full border-2 border-map-ink bg-map-paper"></span>
			</span>
			<span class="text-sm text-chalk/70">Business output</span>
		</li>
	</ul>
</div>
