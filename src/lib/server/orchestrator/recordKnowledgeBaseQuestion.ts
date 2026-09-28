import { findPrimaryExpertiseBrain } from '$lib/server/knowledge/interviewContext';
import { recordBrainEvent } from '$lib/server/brain/recordBrainEvent';
import type { OrchestratedAnswer } from './parseOrchestratedAnswer';
import type { SupabaseClient } from '@supabase/supabase-js';

export type QuestionChannel = 'mcp' | 'api';

// The knowledge base's log is its primary expertise brain's event log, so an
// orchestrated answer is recorded there like a question asked on the site.
// The record is bookkeeping: failing to write it never turns a delivered
// answer into a refund.
export async function recordKnowledgeBaseQuestion(
	supabase: SupabaseClient,
	knowledgeBaseId: string,
	question: string,
	answer: OrchestratedAnswer,
	askedThrough: QuestionChannel
): Promise<void> {
	try {
		const primary = await findPrimaryExpertiseBrain(supabase, knowledgeBaseId);
		if (primary === null) return;
		await recordBrainEvent(supabase, {
			brainId: primary.domainBrainId,
			kind: 'question_answered',
			detail: {
				question,
				answerMarkdown: answer.answerMarkdown,
				citedSlugs: answer.citedPageKeys,
				brainsConsulted: answer.brainsConsulted,
				askedThrough
			}
		});
	} catch (failure) {
		console.error('Recording the knowledge base question failed', failure);
	}
}
