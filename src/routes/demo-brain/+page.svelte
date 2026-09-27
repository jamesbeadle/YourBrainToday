<script lang="ts">
	import BrainConstellation from '$lib/components/brain/BrainConstellation.svelte';
	import {
		demoContexts,
		demoPageIndex,
		demoPageLinks,
		findDemoPage
	} from '$lib/data/demoBrain/demoBrain';
	import type { BrainPagePayload } from '$lib/components/brain/constellation/fetchBrainPage';

	async function loadDemoPage(slug: string): Promise<BrainPagePayload> {
		const page = findDemoPage(slug);
		if (page === null) throw new Error('That page is not in the demo brain');
		const context = demoContexts.find((candidate) => candidate.slug === page.contextSlug);
		return { page, contextName: context?.name ?? null };
	}
</script>

<svelte:head>
	<title>Demo brain — Your Brain Today</title>
</svelte:head>

<div class="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10">
	<header class="flex flex-wrap items-end justify-between gap-4">
		<div class="flex flex-col gap-2">
			<p class="font-mono text-sm tracking-widest text-signal uppercase">Demo brain</p>
			<h1 class="font-display text-3xl font-medium">A construction firm, as a brain</h1>
			<p class="max-w-prose text-chalk/70">
				This is what an expertise brain looks like once the modeller has read a firm’s documents —
				four bounded contexts, the things they track, the language they speak. Drag to orbit,
				click a lobe to dive in, click a neuron to read its page.
			</p>
		</div>
		<a
			href="/knowledge-base"
			class="rounded-full border border-hairline px-5 py-2 font-display text-sm text-chalk/80
				transition hover:border-chalk/40 hover:text-chalk"
		>
			Build your own →
		</a>
	</header>
	<div class="h-[70vh] min-h-105 overflow-hidden rounded-2xl border border-hairline">
	<BrainConstellation
		loadPage={loadDemoPage}
		pageBasePath={null}
		contexts={demoContexts}
		pageIndex={demoPageIndex}
		pageLinks={demoPageLinks}
	/>
	</div>
</div>
