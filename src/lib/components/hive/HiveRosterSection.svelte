<script lang="ts">
	import HiveMemberCard from './HiveMemberCard.svelte';
	import type { HiveMember } from '$lib/data/hiveTypes';

	let { members }: { members: HiveMember[] } = $props();
</script>

<section class="border-y border-hairline bg-carriage/60">
	<div class="mx-auto max-w-6xl px-6 py-16">
		<div class="flex flex-col gap-2">
			<h2 class="font-display text-3xl font-medium">The trades inside</h2>
			<p class="max-w-prose text-chalk/70">
				Every trade here is a reviewed snapshot of a real business's second brain — a business
				that has articulated its knowledge well enough to advise others. The more a trade
				shapes the answers, the more its owner earns.
			</p>
		</div>
		{#if members.length === 0}
			<p class="mt-10 text-sm text-chalk/60">
				No trades yet — yours could be the first. Apply from your knowledge base below.
			</p>
		{:else}
			<div class="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				{#each members as member (member.id)}
					<HiveMemberCard {member} />
				{/each}
			</div>
		{/if}
	</div>
</section>
