<script lang="ts">
	import { renderMarkdown } from './renderMarkdown';

	let { markdown }: { markdown: string } = $props();

	const html = $derived(renderMarkdown(markdown));
</script>

<div
	class="flex flex-col gap-3 leading-relaxed text-chalk/80
		[&_a]:text-signal [&_a]:underline [&_a]:decoration-signal/40 hover:[&_a]:decoration-signal
		[&_code]:rounded [&_code]:bg-night [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-sm
		[&_h1]:font-display [&_h1]:text-2xl [&_h1]:font-medium [&_h1]:text-chalk
		[&_h2]:mt-2 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-medium [&_h2]:text-chalk
		[&_h3]:font-display [&_h3]:text-lg [&_h3]:text-chalk
		[&_li]:ml-5 [&_ol]:list-decimal [&_ul]:list-disc
		[&_strong]:text-chalk [&_table]:text-sm [&_td]:border [&_td]:border-hairline [&_td]:px-2
		[&_td]:py-1 [&_th]:border [&_th]:border-hairline [&_th]:px-2 [&_th]:py-1"
>
	{@html html}
</div>
