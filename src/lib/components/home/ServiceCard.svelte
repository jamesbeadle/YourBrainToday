<script lang="ts">
	import type { KnowledgeService } from '$lib/data/knowledgeServices';

	let { service }: { service: KnowledgeService } = $props();
</script>

<article
	class={`flex flex-col gap-3 rounded-2xl border bg-night p-6
		${service.isLive ? 'border-go' : 'border-hairline'}`}
>
	<div class="flex items-center justify-between gap-3">
		<h3 class="font-display text-lg font-medium">{service.name}</h3>
		{#if service.isLive}
			<span
				class="shrink-0 rounded-full bg-go px-3 py-0.5 font-display text-xs font-medium
					whitespace-nowrap text-night"
			>
				Live now
			</span>
		{:else}
			<span
				class="shrink-0 rounded-full border border-hairline px-3 py-0.5 font-display text-xs
					whitespace-nowrap text-chalk/60"
			>
				Coming soon
			</span>
		{/if}
	</div>
	<p class="font-display text-sm text-signal">{service.tagline}</p>
	<p class="text-sm text-chalk/70">{service.description}</p>
	{#if service.isLive && service.href}
		<a
			href={service.href}
			class="mt-auto self-start pt-2 font-display text-sm text-go underline underline-offset-4
				transition hover:brightness-110"
		>
			Try it now
		</a>
	{/if}
</article>
