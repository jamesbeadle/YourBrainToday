<script lang="ts">
	let {
		editorHref
	}: { editorHref: string | null } = $props();
</script>

<section
	class="mx-auto flex w-full max-w-2xl flex-col items-center gap-4 rounded-2xl border
		border-hairline bg-carriage p-8 text-center"
>
	<h3 class="font-display text-lg font-medium">The modeller keeps this brain</h3>
	<p class="max-w-prose text-sm text-chalk/70">
		A DDD Model brain is maintained by the modeller agent: upload documents and it grows bounded
		contexts, entities, value objects, aggregates, services, and a glossary in your own
		vocabulary — browsable as a constellation, questionable like a colleague.
	</p>
	{#if editorHref === null}
		<p class="text-sm text-caution">
			The linked expertise brain could not be found — it may have been deleted.
		</p>
	{:else}
		<a
			href={editorHref}
			class="rounded-full bg-signal px-6 py-2.5 font-display text-sm font-medium text-night
				transition hover:brightness-110"
		>
			Open the modeller
		</a>
	{/if}
</section>
