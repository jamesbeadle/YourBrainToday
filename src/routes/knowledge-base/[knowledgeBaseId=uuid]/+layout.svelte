<script lang="ts">
	import KnowledgeBaseDashboard from '$lib/components/knowledge/dashboard/KnowledgeBaseDashboard.svelte';

	let { data, children } = $props();
</script>

<KnowledgeBaseDashboard
	knowledgeBase={data.knowledgeBase}
	isOwner={data.isOwner}
	brains={data.brains}
	processMaps={data.processMaps}
	shares={data.shares}
	chatbots={data.chatbots}
	workbench={data.workbench}
>
	{@render children()}
</KnowledgeBaseDashboard>
