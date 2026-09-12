<script lang="ts">
	import KbInterviewPanel from '../KbInterviewPanel.svelte';
	import { defaultInterviewIntro, kindInterviewIntros } from '../interviewRequest';
	import type { KnowledgeKind } from '$lib/data/knowledge/knowledgeKinds';

	let {
		knowledgeBaseId,
		openKind
	}: { knowledgeBaseId: string; openKind: KnowledgeKind | null } = $props();

	/** Inside a brain the interview focuses on that kind; on the constellation it roams the whole knowledge base. */
	const intro = $derived(openKind === null ? defaultInterviewIntro : kindInterviewIntros[openKind]);
</script>

<div class="flex min-h-0 flex-1 flex-col overflow-y-auto p-4">
	<KbInterviewPanel {knowledgeBaseId} focusKind={openKind} {intro} />
</div>
