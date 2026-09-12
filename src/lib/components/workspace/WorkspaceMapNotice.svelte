<script lang="ts">
	import { creditsPerReply } from '$lib/data/creditPricing';

	let { creditBalance }: { creditBalance: number | null } = $props();
</script>

<aside class="flex flex-col gap-4 rounded-2xl border border-hairline bg-carriage p-6">
	<svg viewBox="0 0 240 120" aria-hidden="true" class="w-full">
		<polyline
			points="15,90 90,90 140,40 225,40"
			fill="none"
			stroke="var(--color-signal)"
			stroke-width="8"
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-dasharray="4 14"
		/>
		<polyline
			points="15,30 70,30 120,80 225,80"
			fill="none"
			stroke="var(--color-go)"
			stroke-width="8"
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-dasharray="4 14"
		/>
		<circle cx="118" cy="62" r="8" fill="var(--color-night)" stroke="var(--color-chalk)" stroke-width="3" />
	</svg>
	<h2 class="font-display text-xl font-medium">Your map is being drawn</h2>
	<p class="text-sm text-chalk/70">
		Every role you describe becomes a line, every task a station. Once the agent has enough to
		work with, your Process Map appears here.
	</p>
	<p class="border-t border-hairline pt-3 text-sm text-chalk/50">
		{creditBalance ?? 0}
		{creditBalance === 1 ? 'credit' : 'credits'} remaining · each reply costs {creditsPerReply}
	</p>
</aside>
