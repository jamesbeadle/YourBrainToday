<script lang="ts">
	import ModelUsageRow from './ModelUsageRow.svelte';
	import type { ModelUsageSummary } from '$lib/server/admin/usage/summariseUsageByModel';

	let { models }: { models: ModelUsageSummary[] } = $props();
</script>

{#if models.length === 0}
	<p class="rounded-2xl border border-hairline px-5 py-4 text-sm text-chalk/60">
		No metered calls in this window.
	</p>
{:else}
	<div class="overflow-x-auto rounded-2xl border border-hairline">
		<table class="w-full text-sm">
			<thead class="bg-carriage/60 text-left font-display text-xs tracking-widest text-chalk/50 uppercase">
				<tr>
					<th class="px-5 py-3">Model</th>
					<th class="px-5 py-3 text-right">Calls</th>
					<th class="px-5 py-3 text-right">Input tokens</th>
					<th class="px-5 py-3 text-right">Output tokens</th>
					<th class="px-5 py-3 text-right">Cache read</th>
					<th class="px-5 py-3 text-right">Cache write</th>
					<th class="px-5 py-3 text-right">Cost</th>
					<th class="px-5 py-3 text-right">Credits</th>
					<th class="px-5 py-3 text-right">Margin</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-hairline">
				{#each models as model (model.modelId)}
					<ModelUsageRow {model} />
				{/each}
			</tbody>
		</table>
	</div>
{/if}
