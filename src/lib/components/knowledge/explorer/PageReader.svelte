<script lang="ts">
	import ExplorerBreadcrumb from './ExplorerBreadcrumb.svelte';
	import PageLinkList from './PageLinkList.svelte';
	import PageReaderPager from './PageReaderPager.svelte';
	import MarkdownBody from '../../brain/MarkdownBody.svelte';
	import { domainBlockLabels } from '$lib/data/domainBlocks';
	import { brainHref, knowledgeBaseHref, pageHref } from '$lib/data/knowledge/knowledgeBaseRoutes';
	import type { KbBrainSummary } from '$lib/data/knowledge/knowledgeTypes';
	import type { KnowledgeBase } from '$lib/server/knowledge/getKnowledgeBase';
	import type { PageReading } from '$lib/server/knowledge/explorer/loadPageReading';

	let {
		knowledgeBase,
		brain,
		reading
	}: { knowledgeBase: KnowledgeBase; brain: KbBrainSummary; reading: PageReading } = $props();

	const hrefFor = $derived((slug: string) => pageHref(knowledgeBase.id, brain.id, slug));
	const kindLabel = $derived(domainBlockLabels[reading.page.kind].singular);
	const crumbs = $derived([
		{ label: knowledgeBase.name, href: knowledgeBaseHref(knowledgeBase.id) },
		{ label: brain.name, href: brainHref(knowledgeBase.id, brain.id) },
		...(reading.context === null ? [] : [{ label: reading.context.name, href: null }]),
		{ label: reading.page.title, href: null }
	]);
</script>

<article class="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-6 lg:px-6">
	<ExplorerBreadcrumb {crumbs} />
	<header class="flex flex-col gap-2 border-b border-hairline pb-6">
		<p class="font-mono text-xs tracking-widest text-signal uppercase">{kindLabel}</p>
		<h1 class="font-display text-3xl font-medium text-chalk">{reading.page.title}</h1>
		<p class="text-chalk/60">{reading.page.summary}</p>
	</header>
	<MarkdownBody markdown={reading.page.body} pageHrefFor={hrefFor} />
	<div class="grid gap-6 border-t border-hairline pt-6 sm:grid-cols-3">
		<PageLinkList heading="Linked from" pages={reading.linkedFrom} {hrefFor} />
		<PageLinkList heading="Links to" pages={reading.linksTo} {hrefFor} />
		{#if reading.context !== null}
			<PageLinkList heading={`Also in ${reading.context.name}`} pages={reading.siblings} {hrefFor} />
		{/if}
	</div>
	<PageReaderPager previous={reading.previous} next={reading.next} {hrefFor} />
</article>
