<script lang="ts">
	import type { SharedBrainSummary } from '$lib/data/sharingTypes';
	import type { SharedWorkflowSummary } from '$lib/server/maps/getSharedMaps';

	let {
		sharedBrains,
		sharedWorkflows
	}: { sharedBrains: SharedBrainSummary[]; sharedWorkflows: SharedWorkflowSummary[] } = $props();
</script>

<section class="flex flex-col gap-3">
	<h2 class="font-display text-xs tracking-widest text-chalk/50 uppercase">Shared with you</h2>
	<ul class="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
		{#each sharedBrains as shared (shared.brainId)}
			<li>
				<a
					href={shared.href}
					class="group flex flex-col gap-1 rounded-2xl border border-hairline bg-carriage p-5
						transition hover:border-chalk/30"
				>
					<span class="font-display text-base text-chalk transition group-hover:text-signal">
						{shared.brainName}
					</span>
					<span class="text-xs text-chalk/50">{shared.entityName} · shared expertise brain</span>
				</a>
			</li>
		{/each}
		{#each sharedWorkflows as sharedWorkflow (sharedWorkflow.workflowId)}
			<li>
				<a
					href={`/shared/${sharedWorkflow.workflowId}`}
					class="group flex flex-col gap-1 rounded-2xl border border-hairline bg-carriage p-5
						transition hover:border-chalk/30"
				>
					<span class="font-display text-base text-chalk transition group-hover:text-signal">
						{sharedWorkflow.workflowName}
					</span>
					<span class="text-xs text-chalk/50">
						{sharedWorkflow.entityName} · process brain shared by {sharedWorkflow.ownerEmail}
					</span>
				</a>
			</li>
		{/each}
	</ul>
</section>
