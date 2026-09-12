<script lang="ts">
	import type { BrainEvent } from '$lib/data/brainTypes';

	let { events, pageBasePath }: { events: BrainEvent[]; pageBasePath: string } = $props();

	function describe(event: BrainEvent): string {
		if (event.kind === 'source_ingested') return String(event.detail.logLine ?? 'Source read');
		if (event.kind === 'context_created') return `New context: ${String(event.detail.contextSlug ?? '')}`;
		if (event.kind === 'context_updated') return `Reshaped context: ${String(event.detail.contextSlug ?? '')}`;
		if (event.kind === 'page_created') return `Created ${event.pageSlug}`;
		if (event.kind === 'page_updated') return `Updated ${event.pageSlug}`;
		if (event.kind === 'page_deleted') return `Forgot ${String(event.detail.pageSlug ?? '')}`;
		if (event.kind === 'context_deleted')
			return `Dissolved context: ${String(event.detail.contextSlug ?? '')}`;
		if (event.kind === 'source_removed')
			return String(event.detail.logLine ?? `Removed ${String(event.detail.filename ?? 'a source')}`);
		if (event.kind === 'brain_exported') return 'Exported the brain as Markdown';
		if (event.kind === 'model_pruned') return String(event.detail.logLine ?? 'Pruned the model');
		if (event.kind === 'edition_published')
			return `Published edition: ${String(event.detail.editionName ?? '')}`;
		return `Answered: ${String(event.detail.question ?? '')}`;
	}

	function dayOf(event: BrainEvent): string {
		return new Date(event.createdAt).toLocaleDateString('en-GB', {
			day: 'numeric',
			month: 'short'
		});
	}
</script>

<section class="flex flex-col gap-4 p-4">
	<div>
		
		<p class="text-sm text-chalk/60">Everything the modeller has done, newest first.</p>
	</div>
	{#if events.length === 0}
		<p class="text-sm text-chalk/50">Nothing yet.</p>
	{:else}
		<ul class="flex flex-col gap-2">
			{#each events as event (event.id)}
				<li class="flex items-baseline gap-3 text-sm">
					<span class="shrink-0 font-display text-xs text-chalk/40">{dayOf(event)}</span>
					{#if event.pageSlug !== null}
						<a
							href={`${pageBasePath}/${event.pageSlug}`}
							class="text-chalk/80 transition hover:text-chalk"
						>
							{describe(event)}
						</a>
					{:else}
						<span class="text-chalk/80">{describe(event)}</span>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
</section>
