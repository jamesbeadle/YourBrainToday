<script lang="ts">
	import { page } from '$app/state';
	import KindPickerCard from '$lib/components/knowledge/KindPickerCard.svelte';
	import NewSecondBrainForm from '$lib/components/knowledge/NewSecondBrainForm.svelte';
	import { findKnowledgeKind, knowledgeKinds } from '$lib/data/knowledge/knowledgeKinds';
	import type { KnowledgeKind } from '$lib/data/knowledge/knowledgeKinds';
	import { allKnowledgeBasesHref, knowledgeBaseHref } from '$lib/data/knowledge/knowledgeBaseRoutes';

	let { data } = $props();

	let selectedKind = $state<KnowledgeKind | null>(kindFromQuery(page.url.searchParams.get('kind')));

	const selectedDefinition = $derived(
		selectedKind === null ? null : findKnowledgeKind(selectedKind)
	);

	function kindFromQuery(value: string | null): KnowledgeKind | null {
		const match = knowledgeKinds.find((kind) => kind.kind === value);
		return match?.kind ?? null;
	}
</script>

<svelte:head>
	<title>New Second Brain — {data.knowledgeBase.name}</title>
</svelte:head>

<div class="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-10">
	<nav class="text-sm text-chalk/50">
		<a href={allKnowledgeBasesHref} class="transition hover:text-signal">Knowledge Base</a>
		<span class="mx-2">/</span>
		<a href={knowledgeBaseHref(data.knowledgeBase.id)} class="transition hover:text-signal">
			{data.knowledgeBase.name}
		</a>
		<span class="mx-2">/</span>
		<span class="text-chalk/80">New Second Brain</span>
	</nav>
	<header class="flex flex-col gap-2">
		<h1 class="font-display text-3xl font-medium">What should this brain hold?</h1>
		<p class="max-w-prose text-chalk/70">
			A second brain holds one kind of knowledge. Pick the kind, and it will be built and
			queried the right way for what it holds.
		</p>
	</header>
	<div class="grid gap-3 md:grid-cols-3">
		{#each knowledgeKinds as kind (kind.kind)}
			<KindPickerCard
				{kind}
				isSelected={selectedKind === kind.kind}
				onSelect={() => (selectedKind = kind.kind)}
			/>
		{/each}
	</div>
	{#if selectedDefinition !== null}
		<NewSecondBrainForm kind={selectedDefinition} expertiseBrains={data.domainBrains} />
	{/if}
</div>
