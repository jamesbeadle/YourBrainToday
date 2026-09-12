<script lang="ts">
	import { asCssColour, kindColours } from './constellation/constellationPalette';
	import { domainBlockLabels, domainBlockOrder } from '$lib/data/domainBlocks';
	import type { BrainContext, BrainPageSummary, DomainBlockKind } from '$lib/data/brainTypes';

	let {
		contexts,
		pageIndex,
		pageBasePath,
		onSelectPage
	}: {
		contexts: BrainContext[];
		pageIndex: BrainPageSummary[];
		pageBasePath: string;
		onSelectPage: (slug: string) => void;
	} = $props();

	let chosenContextSlug = $state<string | null>(null);

	const selectedSlug = $derived(chosenContextSlug ?? contexts[0]?.slug ?? null);
	const selectedContext = $derived(contexts.find((context) => context.slug === selectedSlug));
	const contextMapPage = $derived(pageIndex.find((page) => page.kind === 'context_map'));
	const selectedPages = $derived(
		pageIndex.filter((page) => page.contextSlug === selectedSlug && page.kind !== 'context_map')
	);
	const populatedKinds = $derived(
		domainBlockOrder.filter((kind) => selectedPages.some((page) => page.kind === kind))
	);

	function pagesOf(kind: DomainBlockKind): BrainPageSummary[] {
		return selectedPages.filter((page) => page.kind === kind);
	}
</script>

<div class="flex flex-col gap-4 p-4">
	{#if contexts.length === 0}
		<p class="text-sm text-chalk/50">
			No model yet — drop your first document into the terminal and the modeller will start
			building.
		</p>
	{:else}
		<div class="flex flex-wrap gap-1.5">
			{#each contexts as context (context.slug)}
				<button
					type="button"
					onclick={() => (chosenContextSlug = context.slug)}
					aria-pressed={context.slug === selectedSlug}
					class={`flex items-center gap-1.5 rounded-full border px-3 py-1 font-display text-xs
						transition ${
							context.slug === selectedSlug
								? 'border-chalk/40 bg-hairline/50 text-chalk'
								: 'border-hairline text-chalk/60 hover:border-chalk/30 hover:text-chalk'
						}`}
				>
					{#if context.isCoreDomain}
						<span class="h-1.5 w-1.5 rounded-full bg-signal"></span>
					{/if}
					{context.name}
				</button>
			{/each}
		</div>
		{#if selectedContext !== undefined && selectedContext.summary !== ''}
			<p class="text-xs text-chalk/50">{selectedContext.summary}</p>
		{/if}
		{#each populatedKinds as kind (kind)}
			<div class="flex flex-col gap-1.5">
				<p class="font-display text-[10px] tracking-widest text-chalk/40 uppercase">
					{domainBlockLabels[kind].plural}
				</p>
				<div class="flex flex-wrap gap-1.5">
					{#each pagesOf(kind) as page (page.slug)}
						<button
							type="button"
							title={page.summary}
							onclick={() => onSelectPage(page.slug)}
							class="flex items-center gap-1.5 rounded-lg border border-hairline bg-carriage/60
								px-2.5 py-1.5 text-left text-xs text-chalk/80 transition
								hover:border-chalk/30 hover:text-chalk"
						>
							<span
								class="h-1.5 w-1.5 shrink-0 rounded-full"
								style={`background-color: ${asCssColour(kindColours[kind])}`}
							></span>
							{page.title}
						</button>
					{/each}
				</div>
			</div>
		{/each}
		{#if contextMapPage !== undefined}
			<a
				href={`${pageBasePath}/${contextMapPage.slug}`}
				class="font-display text-xs text-chalk/50 underline transition hover:text-chalk"
			>
				How the contexts relate →
			</a>
		{/if}
	{/if}
</div>
