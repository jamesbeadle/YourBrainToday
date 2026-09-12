<script lang="ts">
	import RegisterBrainRow from './RegisterBrainRow.svelte';
	import type { KnowledgeBaseRegisterGroup } from '$lib/server/knowledge/getSecondBrainRegister';

	let { groups }: { groups: KnowledgeBaseRegisterGroup[] } = $props();
</script>

<div class="flex flex-col gap-5">
	{#each groups as group (group.id)}
		<section
			class="overflow-hidden rounded-2xl border border-hairline bg-carriage/40
				{group.isArchived ? 'opacity-60' : ''}"
		>
			<a
				href={`/knowledge-base/${group.id}`}
				class="group flex items-baseline justify-between gap-4 border-b border-hairline
					bg-carriage/80 px-5 py-3.5"
			>
				<span class="flex min-w-0 items-baseline gap-3">
					<span class="shrink-0 font-display text-base font-medium text-chalk">
						{group.name}
					</span>
					{#if group.description !== ''}
						<span class="hidden truncate text-xs text-chalk/40 sm:inline">
							{group.description}
						</span>
					{/if}
					{#if group.isArchived}
						<span class="shrink-0 text-xs text-chalk/40">archived</span>
					{/if}
				</span>
				<span
					class="shrink-0 font-display text-xs text-chalk/40 transition group-hover:text-chalk"
				>
					Open →
				</span>
			</a>
			<div
				class="hidden grid-cols-[auto_1fr_7rem_7.5rem] items-center gap-4 border-b
					border-hairline/60 px-5 py-2 sm:grid"
			>
				<span class="w-9"></span>
				<span class="font-display text-[10px] tracking-widest text-chalk/30 uppercase">
					Second brain
				</span>
				<span class="w-24 text-center font-display text-[10px] tracking-widest text-chalk/30 uppercase">
					Type
				</span>
				<span class="text-right font-display text-[10px] tracking-widest text-chalk/30 uppercase">
					Updated
				</span>
			</div>
			{#if group.brains.length === 0}
				<p class="px-5 py-5 text-sm text-chalk/40">
					Nothing here yet — open this knowledge base to add its first second brain.
				</p>
			{:else}
				<ul class="flex flex-col divide-y divide-hairline/60">
					{#each group.brains as brain (brain.kind + brain.id)}
						<RegisterBrainRow {brain} groupName={group.name} />
					{/each}
				</ul>
			{/if}
		</section>
	{/each}
</div>
