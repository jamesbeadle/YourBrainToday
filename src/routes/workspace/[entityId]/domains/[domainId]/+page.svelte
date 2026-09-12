<script lang="ts">
	import BrainDashboard from '$lib/components/brain/dashboard/BrainDashboard.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>{data.brain.name} — Your Brain Today</title>
</svelte:head>

<BrainDashboard
	brain={data.brain}
	accessRole={data.accessRole}
	contexts={data.contexts}
	pageIndex={data.pageIndex}
	pageLinks={data.pageLinks}
	conversation={data.conversation}
	knowledgeBases={data.knowledgeBases}
	filedKnowledgeBaseId={data.filedKnowledgeBaseId}
	filedKnowledgeBaseName={data.filedKnowledgeBaseName}
	backHref={data.backHref}
/>
