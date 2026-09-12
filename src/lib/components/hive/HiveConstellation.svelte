<script lang="ts">
	import { HiveExperience } from './constellation/createHiveExperience';
	import type { HiveMember } from '$lib/data/hiveTypes';

	let { members }: { members: HiveMember[] } = $props();

	let containerElement = $state<HTMLDivElement>();
	let canvasElement = $state<HTMLCanvasElement>();

	$effect(() => {
		if (canvasElement === undefined || containerElement === undefined) return;
		const mounted = new HiveExperience(canvasElement, containerElement, members);
		return () => mounted.destroy();
	});
</script>

<div bind:this={containerElement} class="relative h-[28rem] overflow-hidden bg-night md:h-[32rem]">
	<canvas bind:this={canvasElement} class="h-full w-full"></canvas>
	<p
		class="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 font-display text-xs
			tracking-widest text-chalk/40 uppercase"
	>
		{members.length === 0
			? 'The hive awaits its first specialist'
			: 'Drag to orbit the hive · every swarm is a specialist'}
	</p>
</div>
