import { findBrainSource } from '../brain/findBrainSource';
import { findPrimaryExpertiseBrain } from '../knowledge/interviewContext';
import { getDomainBrain } from '../entities/getDomainBrain';
import { ingestCreditsFor } from '$lib/data/creditPricing';
import { markKnowledgeGapAnswered } from './markKnowledgeGapAnswered';
import { readSourceToCompletion } from '../brain/reading/readSourceToCompletion';
import { renderTeachingNote } from './renderTeachingNote';
import { discardTeachingNote, storeTeachingNote } from './storeTeachingNote';
import type { OpenKnowledgeGap } from './findOpenKnowledgeGap';
import type { SupabaseClient } from '@supabase/supabase-js';

export type TeachingOutcome =
	| 'taught'
	| 'no_expertise_brain'
	| 'insufficient_credits'
	| 'account_restricted'
	| 'reading_failed';

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
	const brain = primary === null ? null : await getDomainBrain(supabase, primary.domainBrainId);
	if (brain === null) return 'no_expertise_brain';
	const note = renderTeachingNote(chatbot.name, gap, answer);
	const sourceId = await storeTeachingNote(supabase, userId, brain.id, gap.question, note);
	const source = await findBrainSource(supabase, sourceId);
	if (source === null) return 'reading_failed';
	const reading = await readSourceToCompletion(supabase, source, {
		brain,
		payer: { payerId: userId, reason: 'chatbot_teach' },
		proposer: null
	});
	if (reading.status === 'out_of_credits' || reading.status === 'rate_limited') {
		await discardTeachingNote(supabase, sourceId);
		return 'insufficient_credits';
	}
	if (reading.status === 'account_restricted') {
		await discardTeachingNote(supabase, sourceId);
		return 'account_restricted';
	}
	if (reading.status !== 'ingested') return 'reading_failed';
	await markKnowledgeGapAnswered(supabase, gap.id, answer, sourceId);
	return 'taught';
}
