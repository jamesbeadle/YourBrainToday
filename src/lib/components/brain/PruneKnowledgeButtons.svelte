<script lang="ts">
	import PruneKnowledgeButton from './PruneKnowledgeButton.svelte';
	import { pruneTiers } from '$lib/data/pruneTiers';

	let { brainId, onOutOfCredits }: { brainId: string; onOutOfCredits: () => void } = $props();

	const tierKeys = Object.keys(pruneTiers) as (keyof typeof pruneTiers)[];
</script>

<div class="flex flex-col gap-2">
	<div class="flex flex-wrap items-start gap-2">
		{#each tierKeys as tierKey (tierKey)}
			<PruneKnowledgeButton {brainId} {tierKey} {onOutOfCredits} />
		{/each}
	</div>
	<p class="text-xs text-chalk/40">
		Each pass is settled on what it actually costs; the stronger model reads more of the
		model and costs more.
	</p>
</div>
