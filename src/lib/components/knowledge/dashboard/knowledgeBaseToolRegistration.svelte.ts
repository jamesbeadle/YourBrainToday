import type { DashboardToolSide } from './dashboardToolSide.svelte';
import {
	knowledgeBaseToolDefinitions,
	knowledgeBaseToolKeysFor,
	type KnowledgeBaseToolKey
} from './knowledgeBaseTools';
import type { Snippet } from 'svelte';

const toolsOwner = 'knowledge-base';

/**
 * Keeps the knowledge base's tools on the rail for as long as the toolset is
 * mounted. The keys are derived from the role, so a refresh of the page data
 * that leaves the role as it was never re-registers the tools: releasing them
 * closes whichever panel is open, and an upload refreshes the data every time.
 */
export function registerKnowledgeBaseTools(
	railTools: DashboardToolSide,
	isOwner: () => boolean,
	panels: Record<KnowledgeBaseToolKey, Snippet>
): void {
	const toolKeys = $derived(knowledgeBaseToolKeysFor(isOwner()));
	$effect(() => {
		const tools = toolKeys.map((key) => ({ ...knowledgeBaseToolDefinitions[key], panel: panels[key] }));
		railTools.register(toolsOwner, tools);
		return () => railTools.release(toolsOwner);
	});
}
