import { updateProcessFromSource } from './updateProcessFromSource';
import { findBrainFiling } from '$lib/server/knowledge/findBrainFiling';
import { getProcessMaps } from '$lib/server/knowledge/getProcessMaps';
import { getLatestWorkflowMap } from '$lib/server/maps/getLatestWorkflowMap';
import { saveWorkflowMap } from '$lib/server/maps/saveWorkflowMap';
import { harvestCreditsFor } from '$lib/data/creditPricing';
import { spendCredits } from '$lib/server/credits/spendCredits';
import type { StoredBrainSource } from './findBrainSource';
import type { SupabaseClient } from '@supabase/supabase-js';

export type ProcessMapping = {
	tasksAdded: number;
	outcome: 'mapped' | 'unchanged' | 'unfiled' | 'failed';
};

export async function mapSourceProcess(
	supabase: SupabaseClient,
	source: StoredBrainSource,
	contentBlock: unknown
): Promise<ProcessMapping> {
	const filing = await findBrainFiling(supabase, source.brainId);
	if (filing === null) return { tasksAdded: 0, outcome: 'unfiled' };
	const [workflow] = await getProcessMaps(supabase, filing.knowledgeBaseId);
	if (workflow === undefined) return { tasksAdded: 0, outcome: 'unfiled' };
	try {
		return await redrawMap(supabase, source, contentBlock, workflow.id, filing.knowledgeBaseName);
	} catch (failure) {
		console.error('Process map update failed', source.filename, failure);
		return { tasksAdded: 0, outcome: 'failed' };
	}
}

export function processLogLine(mapping: ProcessMapping): string {
	if (mapping.outcome === 'unfiled') return '';
	if (mapping.outcome === 'failed') return ' Process map update failed — re-read to try again.';
	if (mapping.outcome === 'unchanged') return ' Process map unchanged.';
	const noun = mapping.tasksAdded === 1 ? 'task' : 'tasks';
	return ` Process map redrawn with ${mapping.tasksAdded} new ${noun}.`;
}

async function redrawMap(
	supabase: SupabaseClient,
	source: StoredBrainSource,
	contentBlock: unknown,
	workflowId: string,
	businessName: string
): Promise<ProcessMapping> {
	const currentMap = await getLatestWorkflowMap(supabase, workflowId);
	const update = await updateProcessFromSource(contentBlock, source.filename, businessName, currentMap);
	if (JSON.stringify(update.map) === JSON.stringify(currentMap)) {
		return { tasksAdded: 0, outcome: 'unchanged' };
	}
	await saveWorkflowMap(supabase, workflowId, update.map);
	if (update.tasksAdded > 0) {
		await spendCredits(supabase, harvestCreditsFor(update.tasksAdded), 'knowledge_harvest');
	}
	return { tasksAdded: update.tasksAdded, outcome: 'mapped' };
}
