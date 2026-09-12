<script lang="ts">
	import DeleteDomainBrainSection from './DeleteDomainBrainSection.svelte';
	import DomainGoalForm from './DomainGoalForm.svelte';
	import FileIntoKnowledgeBasePanel from './FileIntoKnowledgeBasePanel.svelte';
	import type { DomainBrain } from '$lib/server/entities/getDomainBrain';
	import type { KnowledgeBaseSummary } from '$lib/data/knowledge/knowledgeTypes';

	let {
		brain,
		knowledgeBases,
		filedKnowledgeBaseName
	}: {
		brain: DomainBrain;
		knowledgeBases: KnowledgeBaseSummary[];
		filedKnowledgeBaseName: string | null;
	} = $props();
</script>

<div class="flex min-h-0 flex-1 flex-col gap-8 overflow-y-auto p-4">
	<DomainGoalForm domainGoal={brain.domainGoal} />
	<FileIntoKnowledgeBasePanel {knowledgeBases} {filedKnowledgeBaseName} />
	<DeleteDomainBrainSection brainName={brain.name} />
</div>
