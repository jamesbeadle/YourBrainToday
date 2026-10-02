<script lang="ts">
	import ExplorerFrame from '$lib/components/knowledge/explorer/ExplorerFrame.svelte';
	import KnowledgeExplorer from '$lib/components/knowledge/explorer/KnowledgeExplorer.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Browse — {data.knowledgeBase.name}</title>
</svelte:head>

<ExplorerFrame label="Browse the knowledge base">
	<KnowledgeExplorer knowledgeBaseId={data.knowledgeBase.id} entries={data.entries} />
</ExplorerFrame>
