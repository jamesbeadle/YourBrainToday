import { askKnowledgeBase } from './askKnowledgeBase';
import { recordKnowledgeBaseQuestion, type QuestionChannel } from './recordKnowledgeBaseQuestion';
import { countRecentSpends } from '$lib/server/credits/recentSpendCount';
import { getSiteModel } from '$lib/server/anthropic/getSiteModel';
import { longestQuestion } from '$lib/data/questionLimits';
import { mostSpendsPerMinute, slowDownMessage } from '$lib/server/credits/requireSpendHeadroom';
import { questionFloorCreditsFor } from '$lib/data/creditPricing';
import { refundQuestionUsage } from '$lib/server/credits/refundQuestionUsage';
import { reserveCreditsForPayer } from '$lib/server/credits/reserveCreditsForPayer';
import { settleQuestionUsage } from '$lib/server/credits/settleQuestionUsage';
import type { KnowledgeBase } from '$lib/server/knowledge/getKnowledgeBase';
import type { KnowledgeKind } from '$lib/data/knowledge/knowledgeKinds';
import type { OrchestratedAnswer } from './parseOrchestratedAnswer';
import type { SupabaseClient } from '@supabase/supabase-js';

export type KnowledgeBaseQuestionOutcome =
	| { status: 'answered'; answer: OrchestratedAnswer; creditBalance: number }
	| { status: 'rejected'; message: string }
	| { status: 'out_of_credits' }
	| { status: 'account_restricted' }
	| { status: 'failed'; message: string };

export const knowledgeBaseQuestionReason = 'knowledge_base_question';

/**
 * A question put to a knowledge base from outside the site — over MCP or the
 * API — paid for by its owner as a question on the site is: the floor of the
 * site model reserved first, the marked-up bill settled after, the reserve
 * handed back if the answer fails. Nobody is signed in, so the site model
 * answers and the owner's slider does not apply.
 */
export async function askKnowledgeBaseAndSettle(
	serviceSupabase: SupabaseClient,
	knowledgeBase: KnowledgeBase,
	candidateQuestion: string,
	kinds: KnowledgeKind[],
	askedThrough: QuestionChannel
): Promise<KnowledgeBaseQuestionOutcome> {
	const question = candidateQuestion.trim().slice(0, longestQuestion);
	if (question === '') return { status: 'rejected', message: 'A question is required.' };
	const recentSpends = await countRecentSpends(serviceSupabase, knowledgeBase.ownerId);
	if (recentSpends >= mostSpendsPerMinute) return { status: 'rejected', message: slowDownMessage };
	const model = await getSiteModel();
	const reserve = questionFloorCreditsFor(model);
	const reservation = await reserveCreditsForPayer(knowledgeBase.ownerId, reserve, knowledgeBaseQuestionReason);
	if (reservation === 'insufficient_credits') return { status: 'out_of_credits' };
	if (reservation === 'account_restricted') return { status: 'account_restricted' };
	try {
		const answer = await askKnowledgeBase(serviceSupabase, { knowledgeBase, question, kinds, model });
		await recordKnowledgeBaseQuestion(serviceSupabase, knowledgeBase.id, question, answer, askedThrough);
		const settledBalance = await settleQuestionUsage(knowledgeBase.ownerId, reserve, knowledgeBaseQuestionReason);
		return { status: 'answered', answer, creditBalance: settledBalance ?? reservation.creditBalance };
	} catch (failure) {
		console.error('Knowledge base question failed', failure);
		await refundQuestionUsage(knowledgeBase.ownerId, reserve, knowledgeBaseQuestionReason);
		return { status: 'failed', message: 'That question failed — the credits were refunded.' };
	}
}
