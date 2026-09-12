<script lang="ts">
	import type { ChatbotTopUp } from '$lib/data/chatbotTypes';

	let { topUps }: { topUps: ChatbotTopUp[] } = $props();

	const dateFormat = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
</script>

<div class="flex flex-col gap-3 rounded-2xl border border-hairline bg-carriage p-5">
	<h2 class="font-display text-lg font-medium">Top-ups</h2>
	{#if topUps.length === 0}
		<p class="text-sm text-chalk/50">No top-ups yet.</p>
	{:else}
		<ul class="flex flex-col divide-y divide-hairline text-sm">
			{#each topUps as topUp (topUp.id)}
				<li class="flex items-center justify-between gap-3 py-2">
					<span class="text-chalk/60">{dateFormat.format(new Date(topUp.createdAt))}</span>
					<span class="font-mono">+{topUp.credits}</span>
				</li>
			{/each}
		</ul>
	{/if}
</div>
