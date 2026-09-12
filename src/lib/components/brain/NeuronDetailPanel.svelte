<script lang="ts">
	import MarkdownBody from './MarkdownBody.svelte';
	import { domainBlockLabels } from '$lib/data/domainBlocks';
	import type { BrainPagePayload } from './constellation/fetchBrainPage';

	let {
		loadPage,
		slug,
		pageBasePath,
		onClose
	}: {
		loadPage: (slug: string) => Promise<BrainPagePayload>;
		slug: string;
		pageBasePath: string | null;
		onClose: () => void;
	} = $props();

	let payload = $state<BrainPagePayload | null>(null);
	let loadFailure = $state<string | null>(null);

	$effect(() => {
		payload = null;
		loadFailure = null;
		loadPage(slug)
			.then((loaded) => (payload = loaded))
			.catch((failure: Error) => (loadFailure = failure.message));
	});

	const kindLine = $derived(describeKind(payload));

	function describeKind(loaded: BrainPagePayload | null): string {
		if (loaded === null) return '';
		const kindLabel = domainBlockLabels[loaded.page.kind].singular;
		if (loaded.contextName === null) return kindLabel;
		return `${kindLabel} · ${loaded.contextName}`;
	}
</script>

<aside
	class="absolute inset-y-0 right-0 z-20 flex w-full max-w-md flex-col border-l border-hairline
		bg-night/80 backdrop-blur-md"
>
	<header class="flex items-start gap-3 border-b border-hairline p-4 lg:p-5">
		<button
			type="button"
			onclick={onClose}
			aria-label="Close neuron detail"
			class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-hairline
				font-display text-sm text-chalk/70 transition hover:border-chalk/40 hover:text-chalk"
		>
			✕
		</button>
		<div class="flex min-w-0 flex-col gap-1">
			<p class="font-display text-xs tracking-widest text-signal uppercase">{kindLine}</p>
			<h3 class="font-display text-xl font-medium text-chalk">{payload?.page.title ?? '…'}</h3>
		</div>
	</header>
	<div class="flex-1 overflow-y-auto p-5">
		{#if loadFailure !== null}
			<p class="text-sm text-signal">{loadFailure}</p>
		{:else if payload === null}
			<p class="animate-pulse text-sm text-chalk/50">Reading the neuron…</p>
		{:else}
			<p class="mb-4 text-sm text-chalk/60">{payload.page.summary}</p>
			<MarkdownBody markdown={payload.page.body} />
		{/if}
	</div>
	{#if pageBasePath !== null}
		<footer class="border-t border-hairline p-4">
			<a
				href={`${pageBasePath}/${slug}`}
				class="font-display text-sm text-chalk/80 underline transition hover:text-chalk"
			>
				Open the full page →
			</a>
		</footer>
	{/if}
</aside>
