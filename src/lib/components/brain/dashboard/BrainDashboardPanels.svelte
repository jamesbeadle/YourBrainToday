<script lang="ts">
	import BrainSettingsPanel from './BrainSettingsPanel.svelte';
	import BrainTerminal from './BrainTerminal.svelte';
	import DomainModelIndex from '../DomainModelIndex.svelte';
	import KbInterviewPanel from '../../knowledge/KbInterviewPanel.svelte';
	import PruneKnowledgeButton from '../PruneKnowledgeButton.svelte';
	import { kindInterviewIntros } from '../../knowledge/interviewRequest';
	import type { DomainBrain } from '$lib/server/entities/getDomainBrain';
	import type { KnowledgeBaseSummary } from '$lib/data/knowledge/knowledgeTypes';
	import type { SectionKey } from './railIcons';
	import type {
		BrainContext,
		BrainConversationThread,
		BrainPageSummary
	} from '$lib/data/brainTypes';

	let {
		section,
		brain,
		conversation,
		contexts,
		pageIndex,
		pageBasePath,
		knowledgeBases,
		filedKnowledgeBaseId,
		filedKnowledgeBaseName,
		isOwner,
		onOutOfCredits,
		onSelectPage
	}: {
		section: SectionKey;
		brain: DomainBrain;
		conversation: BrainConversationThread;
		contexts: BrainContext[];
		pageIndex: BrainPageSummary[];
		pageBasePath: string;
		knowledgeBases: KnowledgeBaseSummary[];
		filedKnowledgeBaseId: string | null;
		filedKnowledgeBaseName: string | null;
		isOwner: boolean;
		onOutOfCredits: () => void;
		onSelectPage: (slug: string) => void;
	} = $props();
</script>

{#if section === 'interview'}
	<div class="min-h-0 flex-1 overflow-y-auto p-4">
		{#if filedKnowledgeBaseId === null}
			<p class="text-sm text-chalk/60">
				File this brain in a knowledge base (in Settings) and the interviewer can work on it —
				asking about the gaps and filing every answer as you talk.
			</p>
		{:else}
			<KbInterviewPanel
				knowledgeBaseId={filedKnowledgeBaseId}
				focusKind="expertise"
				intro={kindInterviewIntros.expertise}
			/>
		{/if}
	</div>
{:else if section === 'terminal'}
	<BrainTerminal
		brainId={brain.id}
		conversationId={conversation.conversationId}
		messages={conversation.messages}
		{pageIndex}
		{pageBasePath}
		{onOutOfCredits}
	/>
{:else if section === 'model'}
	<div class="min-h-0 flex-1 overflow-y-auto">
		{#if isOwner}
			<div class="px-4 pt-4">
				<PruneKnowledgeButton brainId={brain.id} {onOutOfCredits} />
			</div>
		{/if}
		<DomainModelIndex {contexts} {pageIndex} {pageBasePath} {onSelectPage} />
	</div>
{:else}
	<BrainSettingsPanel {brain} {knowledgeBases} {filedKnowledgeBaseName} />
{/if}
