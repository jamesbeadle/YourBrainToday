import { getLatestWorkflowMap } from '$lib/server/maps/getLatestWorkflowMap';
import { brainHref } from '$lib/data/knowledge/knowledgeBaseRoutes';
import type { KnowledgeIndexEntry } from '$lib/data/knowledge/knowledgeIndex';
import type { ProcessMapSummary } from '../getProcessMaps';
import type { WorkflowRole, WorkflowTask } from '$lib/data/workflowModel';
import type { SupabaseClient } from '@supabase/supabase-js';

const taskKindLabel = 'Task';

export async function indexProcessTasks(
	supabase: SupabaseClient,
	knowledgeBaseId: string,
	processMap: ProcessMapSummary
): Promise<KnowledgeIndexEntry[]> {
	const latestMap = await getLatestWorkflowMap(supabase, processMap.id);
	const href = brainHref(knowledgeBaseId, processMap.id);
	return latestMap.roles.flatMap((role) =>
		role.tasks.map((task) => taskEntry(processMap, role, task, href))
	);
}

function taskEntry(
	processMap: ProcessMapSummary,
	role: WorkflowRole,
	task: WorkflowTask,
	href: string
): KnowledgeIndexEntry {
	return {
		id: `task:${processMap.id}:${role.name}:${task.name}`,
		kind: 'process',
		kindLabel: taskKindLabel,
		brainId: processMap.id,
		brainName: processMap.name,
		title: task.name,
		summary: task.summary,
		detail: role.name,
		date: null,
		href
	};
}
