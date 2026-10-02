import { updateProcessFromSource } from './updateProcessFromSource';
import { findBrainFiling } from '$lib/server/knowledge/findBrainFiling';
import { getProcessMaps } from '$lib/server/knowledge/getProcessMaps';
import { getLatestWorkflowMap } from '$lib/server/maps/getLatestWorkflowMap';
import { saveWorkflowMapFor } from '$lib/server/maps/saveWorkflowMapFor';
import type { StoredBrainSource } from './findBrainSource';
import type { SupabaseClient } from '@supabase/supabase-js';

export type ProcessMapping = {
	tasksAdded: number;
	outcome: 'mapped' | 'unchanged' | 'unfiled';
};

/** The knowledge base's first process map, redrawn with whatever the source says about how work flows. */
export async function mapSourceProcess(
	supabase: SupabaseClient,
	source: StoredBrainSource,
	contentBlock: unknown,
	ownerId: string
): Promise<ProcessMapping> {
	const filing = await findBrainFiling(supabase, source.brainId);
	if (filing === null) return { tasksAdded: 0, outcome: 'unfiled' };
	const [workflow] = await getProcessMaps(supabase, filing.knowledgeBaseId);
	if (workflow === undefined) return { tasksAdded: 0, outcome: 'unfiled' };
	const currentMap = await getLatestWorkflowMap(supabase, workflow.id);
	const update = await updateProcessFromSource(
		contentBlock,
		source.filename,
		filing.knowledgeBaseName,
		currentMap
	);
	if (JSON.stringify(update.map) === JSON.stringify(currentMap)) {
		return { tasksAdded: 0, outcome: 'unchanged' };
	}
	await saveWorkflowMapFor(ownerId, workflow.id, update.map);
	return { tasksAdded: update.tasksAdded, outcome: 'mapped' };
}

export function processLogLine(mapping: ProcessMapping): string {
	if (mapping.outcome === 'unfiled') return '';
	if (mapping.outcome === 'unchanged') return ' Process map unchanged.';
	const noun = mapping.tasksAdded === 1 ? 'task' : 'tasks';
	return ` Process map redrawn with ${mapping.tasksAdded} new ${noun}.`;
}
