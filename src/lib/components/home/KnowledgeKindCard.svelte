<script lang="ts">
	import type { KnowledgeKindDefinition } from '$lib/data/knowledge/knowledgeKinds';

	let {
		kind,
		example,
		href,
		callToAction
	}: {
		kind: KnowledgeKindDefinition;
		example: string;
		href: string;
		callToAction: string;
	} = $props();
</script>

<article
	class="flex flex-col gap-3 rounded-2xl border border-hairline bg-night p-6"
	style={`border-top: 3px solid ${kind.accent}`}
>
	<span
		class="self-start rounded-full border px-2.5 py-0.5 font-display text-xs tracking-wider uppercase"
		style={`border-color: ${kind.accent}66; color: ${kind.accent}`}
	>
		{kind.label}
	</span>
	<h3 class="font-display text-2xl font-medium">{kind.question}</h3>
	<p class="text-sm text-chalk/70">{kind.explainer}</p>
	<p class="text-sm text-chalk/50 italic">{example}</p>
	<a
		href={href}
		class="mt-auto self-start pt-2 font-display text-sm underline underline-offset-4 transition
			hover:brightness-110"
		style={`color: ${kind.accent}`}
	>
		{callToAction}
	</a>
</article>
