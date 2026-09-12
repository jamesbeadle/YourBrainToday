import { findBrainSource, markSourceStatus } from '../brain/findBrainSource';
import { findPrimaryExpertiseBrain } from '../knowledge/interviewContext';
import { ingestCreditsFor } from '$lib/data/creditPricing';
import { markKnowledgeGapAnswered } from './markKnowledgeGapAnswered';
import { refundQuestionUsage } from '../credits/refundQuestionUsage';
import { renderTeachingNote } from './renderTeachingNote';
import { runSourceIngest } from '../brain/runSourceIngest';
import { settleQuestionUsage } from '../credits/settleQuestionUsage';
import { spendCredits } from '../credits/spendCredits';
import { byteCountOf, discardTeachingNote, storeTeachingNote } from './storeTeachingNote';
import type { OpenKnowledgeGap } from './findOpenKnowledgeGap';
import type { SupabaseClient } from '@supabase/supabase-js';

export type TeachingOutcome =
	| 'taught'
	| 'no_expertise_brain'
	| 'insufficient_credits'
	| 'account_restricted'
	| 'reading_failed';

const teachingSpendReason = 'chatbot_teach';
const failureSummaryLimit = 160;

// A note is far below the size at which a document's price climbs.
export const teachingNoteCredits = ingestCreditsFor(0);

// The owner's answer becomes a source document on the knowledge base's
// primary expertise brain and is read by the Modeller like any other, so
// the bot finds it in the model index from the next question on.
export async function teachChatbotAnswer(
	supabase: SupabaseClient,
	userId: string,
	chatbot: { name: string; knowledgeBaseId: string },
	gap: OpenKnowledgeGap,
	answer: string
): Promise<TeachingOutcome> {
	const primary = await findPrimaryExpertiseBrain(supabase, chatbot.knowledgeBaseId);
	if (primary === null) return 'no_expertise_brain';
	const note = renderTeachingNote(chatbot.name, gap, answer);
	const sourceId = await storeTeachingNote(supabase, userId, primary.domainBrainId, gap.question, note);
	const reserve = ingestCreditsFor(byteCountOf(note));
	const spend = await spendCredits(supabase, reserve, teachingSpendReason);
	if (typeof spend === 'string') {
		await discardTeachingNote(supabase, sourceId);
		return spend;
	}
	try {
		await readNoteIntoBrain(supabase, sourceId);
	} catch (failure) {
		console.error('Teaching the chatbot failed', failure);
		await markSourceStatus(supabase, sourceId, 'failed', failureSummary(failure));
		await refundQuestionUsage(userId, reserve, teachingSpendReason);
		return 'reading_failed';
	}
	await markKnowledgeGapAnswered(supabase, gap.id, answer, sourceId);
	await settleQuestionUsage(userId, reserve, teachingSpendReason);
	return 'taught';
}

async function readNoteIntoBrain(supabase: SupabaseClient, sourceId: string): Promise<void> {
	const source = await findBrainSource(supabase, sourceId);
	if (source === null) throw new Error('The answer note was not stored');
	await runSourceIngest(supabase, source);
}

function failureSummary(failure: unknown): string {
	const message = failure instanceof Error ? failure.message : 'Unknown failure';
	return message.slice(0, failureSummaryLimit);
}
