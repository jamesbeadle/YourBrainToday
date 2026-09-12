<script lang="ts">
	import DeleteDomainBrainSection from '../../brain/dashboard/DeleteDomainBrainSection.svelte';
	import DomainGoalForm from '../../brain/dashboard/DomainGoalForm.svelte';
	import type { DomainBrain } from '$lib/server/entities/getDomainBrain';

	let { brain, actionBasePath }: { brain: DomainBrain; actionBasePath: string } = $props();
</script>

<div class="flex min-h-0 flex-1 flex-col gap-8 overflow-y-auto p-4">
	<DomainGoalForm domainGoal={brain.domainGoal} {actionBasePath} />
	<section class="flex flex-col gap-2 border-t border-hairline pt-6">
		<h3 class="font-display text-sm text-chalk">Export</h3>
		<p class="text-xs leading-relaxed text-chalk/60">
			Every page of the model as one Markdown document, ready to read or hand to another tool.
		</p>
		<a
			href={`/api/brain/export?brain=${brain.id}`}
			download
			class="self-start rounded-full border border-hairline px-4 py-2 font-display text-sm
				text-chalk/80 transition hover:border-signal hover:text-signal"
		>
			Export as Markdown
		</a>
	</section>
	<DeleteDomainBrainSection brainName={brain.name} {actionBasePath} />
</div>
