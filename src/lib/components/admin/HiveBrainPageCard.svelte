<script lang="ts">
	import MarkdownBody from '$lib/components/brain/MarkdownBody.svelte';
	import { domainBlockLabels, isDomainBlockKind } from '$lib/data/domainBlocks';
	import type { HiveApplicationPage } from '$lib/server/hive/hiveApplicationBrain';

	let { page }: { page: HiveApplicationPage } = $props();

	const kindLabel = $derived(
		isDomainBlockKind(page.kind) ? domainBlockLabels[page.kind].singular : page.kind
	);
</script>

<li class="rounded-2xl border border-hairline">
	<details>
		<summary class="cursor-pointer p-4">
			<span class="inline-flex flex-wrap items-baseline gap-2">
				<span class="font-display text-sm font-medium">{page.title}</span>
				<span class="rounded-full border border-hairline px-2 py-0.5 font-display text-xs text-chalk/50">
					{kindLabel}
				</span>
				{#if page.summary !== ''}
					<span class="text-xs text-chalk/50">{page.summary}</span>
				{/if}
			</span>
		</summary>
		<div class="border-t border-hairline p-4">
			<MarkdownBody markdown={page.body} />
		</div>
	</details>
</li>
