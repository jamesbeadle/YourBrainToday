<script lang="ts">
	import WorkspaceMap from '$lib/components/workspace/WorkspaceMap.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>{data.workflowName} — Your Brain Today</title>
</svelte:head>

<div class="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10">
	<header class="flex flex-col gap-2">
		<p class="font-mono text-sm tracking-widest text-go uppercase">Shared with you</p>
		<h1 class="font-display text-3xl font-medium">{data.workflowName}</h1>
		<p class="text-chalk/70">Shared by {data.ownerEmail} · view only</p>
	</header>
	<WorkspaceMap model={data.model} />
</div>
