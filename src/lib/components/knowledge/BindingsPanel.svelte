<script lang="ts">
	import { enhance } from '$app/forms';
	import type { KbBrainSummary } from '$lib/data/knowledge/knowledgeTypes';

	let {
		domainBrains,
		boundDomainBrainIds,
		actionBasePath
	}: { domainBrains: KbBrainSummary[]; boundDomainBrainIds: string[]; actionBasePath: string } =
		$props();

	function isBound(domainBrain: KbBrainSummary): boolean {
		return boundDomainBrainIds.includes(domainBrain.id);
	}

	function bindingActionHref(domainBrain: KbBrainSummary): string {
		return `${actionBasePath}?/${isBound(domainBrain) ? 'unbindDomain' : 'bindDomain'}`;
	}
</script>

<div class="flex flex-col gap-2">
	<p class="text-xs text-chalk/50">
		Bound expertise brains guide and validate what this brain stores.
	</p>
	{#if domainBrains.length === 0}
		<p class="text-sm text-chalk/40">This knowledge base has no expertise brains yet.</p>
	{/if}
	<ul class="flex flex-col divide-y divide-hairline">
		{#each domainBrains as domainBrain (domainBrain.id)}
			<li class="flex items-center justify-between gap-3 py-2">
				<span class="truncate text-sm">{domainBrain.name}</span>
				<form method="POST" action={bindingActionHref(domainBrain)} use:enhance>
					<input type="hidden" name="domainBrainId" value={domainBrain.id} />
					<button
						type="submit"
						class="rounded-full border px-3 py-1 text-xs transition
							{isBound(domainBrain)
							? 'border-go/60 text-go hover:border-signal hover:text-signal'
							: 'border-hairline text-chalk/60 hover:border-go hover:text-go'}"
					>
						{isBound(domainBrain) ? 'Bound — unbind' : 'Bind'}
					</button>
				</form>
			</li>
		{/each}
	</ul>
</div>
