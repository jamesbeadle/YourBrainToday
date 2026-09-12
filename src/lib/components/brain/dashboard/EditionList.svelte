<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { requestEditionPublish } from './sellRequests';
	import type { BrainEdition } from '$lib/data/marketTypes';

	let { brainId, editions }: { brainId: string; editions: BrainEdition[] } = $props();

	let editionName = $state('');
	let isPublishing = $state(false);
	let notice = $state<{ tone: 'go' | 'caution'; message: string } | null>(null);

	async function publish(event: SubmitEvent) {
		event.preventDefault();
		if (editionName.trim() === '' || isPublishing) return;
		isPublishing = true;
		notice = null;
		const outcome = await requestEditionPublish(brainId, editionName);
		isPublishing = false;
		if (!outcome.isSaved) return void (notice = { tone: 'caution', message: outcome.message });
		notice = { tone: 'go', message: 'Edition published — buyers get this frozen copy.' };
		editionName = '';
		await invalidateAll();
	}

	function formatPublishedDate(isoDate: string): string {
		return new Date(isoDate).toLocaleDateString('en-GB', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	}
</script>

<div class="flex flex-col gap-3">
	<form onsubmit={publish} class="flex gap-2">
		<input
			bind:value={editionName}
			placeholder="Edition name, e.g. Summer 2026"
			class="min-w-0 flex-1 rounded-xl border border-hairline bg-night px-3 py-2 text-sm
				text-chalk placeholder-chalk/30 outline-none focus:border-chalk/40"
		/>
		<button
			type="submit"
			disabled={isPublishing}
			class="rounded-full border border-signal/60 px-4 py-2 font-display text-xs text-signal
				transition hover:bg-signal hover:text-night disabled:opacity-40"
		>
			{isPublishing ? 'Publishing…' : 'Publish edition'}
		</button>
	</form>
	{#if notice !== null}
		<p class={`text-xs ${notice.tone === 'go' ? 'text-go' : 'text-caution'}`}>{notice.message}</p>
	{/if}
	{#if editions.length > 0}
		<ul class="flex flex-col gap-1.5">
			{#each editions as edition (edition.id)}
				<li
					class="flex items-center justify-between rounded-xl border border-hairline px-3 py-2
						text-sm"
				>
					<span class="text-chalk">v{edition.version} — {edition.name}</span>
					<span class="text-xs text-chalk/50">{formatPublishedDate(edition.publishedAt)}</span>
				</li>
			{/each}
		</ul>
	{/if}
</div>
