<script lang="ts">
	import type { LegalDocument } from '$lib/data/legalDocument';

	let { legalDocument }: { legalDocument: LegalDocument } = $props();
</script>

<article class="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-16">
	<p class="font-display text-sm tracking-widest text-signal uppercase">The small print</p>
	<h1 class="font-display text-4xl leading-tight font-medium">{legalDocument.title}</h1>
	<p class="text-sm text-chalk/50">Last updated {legalDocument.lastUpdatedOn}</p>
	{#each legalDocument.sections as section (section.heading)}
		<h2 class="font-display text-2xl font-medium">{section.heading}</h2>
		{#each section.paragraphs as paragraph (paragraph)}
			<p class="text-chalk/80">{paragraph}</p>
		{/each}
		{#if section.listItems}
			<ul class="flex list-disc flex-col gap-2 pl-6 text-chalk/80">
				{#each section.listItems as listItem (listItem)}
					<li>{listItem}</li>
				{/each}
			</ul>
		{/if}
	{/each}
</article>
