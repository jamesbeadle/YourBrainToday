<script lang="ts">
	import MarkdownBody from '$lib/components/brain/MarkdownBody.svelte';
	import { domainBlockLabels } from '$lib/data/domainBlocks';

	let { data } = $props();

	const kindLabel = $derived(domainBlockLabels[data.page.kind].singular);
</script>

<svelte:head>
	<title>{data.page.title} — {data.brain.name}</title>
</svelte:head>

<article class="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-12">
	<a
		href={`/workspace/${data.brain.entityId}/domains/${data.brain.id}`}
		class="font-display text-sm text-chalk/60 transition hover:text-chalk"
	>
		← Back to {data.brain.name}
	</a>
	<header class="flex flex-col gap-2 border-b border-hairline pb-6">
		<p class="font-display text-xs tracking-widest text-signal uppercase">
			{kindLabel}{data.contextName === null ? '' : ` · ${data.contextName}`}
		</p>
		<h1 class="font-display text-3xl font-medium">{data.page.title}</h1>
		<p class="text-chalk/60">{data.page.summary}</p>
	</header>
	<MarkdownBody markdown={data.page.body} />
</article>
