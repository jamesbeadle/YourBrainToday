import { askInterviewer, type InterviewTurnInput } from './interviewAgent';
import { buildInterviewContext, findPrimaryExpertiseBrain } from './interviewContext';
import { findInterviewProcessMap, type InterviewProcessMap } from './findInterviewProcessMap';
import { deriveInterviewState } from '$lib/server/agent/deriveInterviewState';
import { fileHarvestToKnowledgeBase } from '$lib/server/agent/fileHarvestedKnowledge';
import { harvestedItemCount } from '$lib/server/agent/parseHarvest';
import { saveWorkflowMapFor } from '$lib/server/maps/saveWorkflowMapFor';
import type { InterviewFocus } from './interviewPrompt';
import type { InterviewPhase } from '$lib/server/agent/interview/gapTypes';
import type { WorkflowModel } from '$lib/data/workflowModel';
import type { SupabaseClient } from '@supabase/supabase-js';

export type InterviewTurnOutcome = {
	reply: string;
	harvestedCount: number;
	phase: InterviewPhase | null;
	wasMapRedrawn: boolean;
};

type KnowledgeBaseRef = { id: string; name: string; ownerId: string };

/** One turn of the interview: the question asked, the answer harvested, and the process map redrawn when it changed. */
export async function takeInterviewTurn(
	supabase: SupabaseClient,
	knowledgeBase: KnowledgeBaseRef,
	conversation: InterviewTurnInput[],
	focus: InterviewFocus
): Promise<InterviewTurnOutcome> {
	const primary = await findPrimaryExpertiseBrain(supabase, knowledgeBase.id);
	const processMap = await findInterviewProcessMap(supabase, knowledgeBase.id);
	const context = await buildInterviewContext(
		supabase,
		knowledgeBase.id,
		knowledgeBase.name,
		primary,
		processMap === null ? null : processMap.model
	);
	const turn = await askInterviewer(conversation, context, focus);
	await fileHarvestToKnowledgeBase(supabase, knowledgeBase.id, turn.harvest);
	const redrawnMap = await saveRedrawnMap(knowledgeBase.ownerId, processMap, turn.map);
	return {
		reply: turn.reply,
		harvestedCount: harvestedItemCount(turn.harvest),
		phase: phaseOf(redrawnMap ?? processMap?.model ?? null),
		wasMapRedrawn: redrawnMap !== null
	};
}

async function saveRedrawnMap(
	ownerId: string,
	processMap: InterviewProcessMap | null,
	redrawnMap: WorkflowModel | null
): Promise<WorkflowModel | null> {
	if (processMap === null || redrawnMap === null) return null;
	const isUnchanged = JSON.stringify(redrawnMap) === JSON.stringify(processMap.model);
	if (isUnchanged) return null;
	await saveWorkflowMapFor(ownerId, processMap.workflowId, redrawnMap);
	return redrawnMap;
}

function phaseOf(processMap: WorkflowModel | null): InterviewPhase | null {
	if (processMap === null) return null;
	return deriveInterviewState(processMap).phase;
}
