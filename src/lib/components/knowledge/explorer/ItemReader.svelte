<script lang="ts">
	import ExplorerBreadcrumb from './ExplorerBreadcrumb.svelte';
	import ItemDataList from './ItemDataList.svelte';
	import ItemLinkList from './ItemLinkList.svelte';
	import { childLinks, connectionLinks, dateLabel } from './itemReaderLinks';
	import { itemKindLabel } from '$lib/data/knowledge/knowledgeIndex';
	import { brainHref, itemHref, knowledgeBaseHref } from '$lib/data/knowledge/knowledgeBaseRoutes';
	import type { KbBrainSummary } from '$lib/data/knowledge/knowledgeTypes';
	import type { KnowledgeBase } from '$lib/server/knowledge/getKnowledgeBase';
	import type { ItemReading } from '$lib/server/knowledge/explorer/loadItemReading';

	let {
		knowledgeBase,
		brain,
		reading
	}: { knowledgeBase: KnowledgeBase; brain: KbBrainSummary; reading: ItemReading } = $props();

	const item = $derived(reading.item);
	const parentHref = $derived(
		reading.parent === null ? null : itemHref(knowledgeBase.id, brain.id, reading.parent.id)
	);
	const crumbs = $derived([
		{ label: knowledgeBase.name, href: knowledgeBaseHref(knowledgeBase.id) },
		{ label: brain.name, href: brainHref(knowledgeBase.id, brain.id) },
		...(reading.parent === null ? [] : [{ label: reading.parent.title, href: parentHref }]),
		{ label: item.title, href: null }
	]);
	const dateLines = $derived(
		[
			['Occurred', item.occurredAt],
			['Valid from', item.validFrom],
			['Valid to', item.validTo],
			['Recorded', item.createdAt]
		].filter((line): line is [string, string] => line[1] !== null)
	);
</script>

<article class="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-6 lg:px-6">
	<ExplorerBreadcrumb {crumbs} />
	<header class="flex flex-col gap-2 border-b border-hairline pb-6">
		<p class="font-mono text-xs tracking-widest text-signal uppercase">
			{itemKindLabel(item.itemKind)} · {brain.name}
		</p>
		<h1 class="font-display text-3xl font-medium text-chalk">{item.title}</h1>
		<p class="flex flex-wrap gap-x-4 gap-y-1 font-display text-xs text-chalk/50">
			{#each dateLines as [label, moment] (label)}
				<span>{label} {dateLabel(moment)}</span>
			{/each}
		</p>
	</header>
	{#if item.body !== ''}
		<p class="leading-relaxed whitespace-pre-line text-chalk/80">{item.body}</p>
	{/if}
	<ItemDataList {item} />
	<div class="grid gap-6 border-t border-hairline pt-6 sm:grid-cols-2">
		{#if reading.parent !== null}
			<ItemLinkList heading="In case" links={[{ label: reading.parent.title, href: parentHref }]} />
		{/if}
		<ItemLinkList heading="Episodes" links={childLinks(knowledgeBase.id, brain.id, reading.children)} />
		<ItemLinkList
			heading="Between"
			links={connectionLinks(knowledgeBase.id, brain.id, reading.connectionEnds)}
		/>
	</div>
</article>
