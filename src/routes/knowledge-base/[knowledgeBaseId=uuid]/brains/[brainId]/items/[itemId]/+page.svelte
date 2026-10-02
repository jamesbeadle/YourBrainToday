<script lang="ts">
	import ExplorerFrame from '$lib/components/knowledge/explorer/ExplorerFrame.svelte';
	import ItemReader from '$lib/components/knowledge/explorer/ItemReader.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>{data.reading.item.title} — {data.brain.name}</title>
</svelte:head>

<ExplorerFrame label={data.reading.item.title} isInsideBrain>
	<ItemReader knowledgeBase={data.knowledgeBase} brain={data.brain} reading={data.reading} />
</ExplorerFrame>
