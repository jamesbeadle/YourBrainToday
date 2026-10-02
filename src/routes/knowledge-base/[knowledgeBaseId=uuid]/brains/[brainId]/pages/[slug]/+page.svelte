<script lang="ts">
	import ExplorerFrame from '$lib/components/knowledge/explorer/ExplorerFrame.svelte';
	import PageReader from '$lib/components/knowledge/explorer/PageReader.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>{data.reading.page.title} — {data.brain.name}</title>
</svelte:head>

<ExplorerFrame label={data.reading.page.title} isInsideBrain>
	<PageReader knowledgeBase={data.knowledgeBase} brain={data.brain} reading={data.reading} />
</ExplorerFrame>
