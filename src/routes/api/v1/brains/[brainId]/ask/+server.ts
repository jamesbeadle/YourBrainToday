import { error, json } from '@sveltejs/kit';
import { askModeller } from '$lib/server/brain/askModeller';
import { createBrainConversation } from '$lib/server/brain/createBrainConversation';
import { getBrainContexts } from '$lib/server/brain/getBrainContexts';
import { getBrainPageIndex } from '$lib/server/brain/getBrainPageIndex';
import { recordBrainEvent } from '$lib/server/brain/recordBrainEvent';
import { recordConversationTurn } from '$lib/server/brain/recordConversationTurn';
import { rememberedTurns } from '$lib/server/brain/rememberedTurns';
import {
	apiQuestionReason,
	refundForApiQuestion,
	settleForApiQuestion,
	spendForApiQuestion
} from '$lib/server/brainApi/spendForApiQuestion';
import { requireSpendHeadroom } from '$lib/server/credits/requireSpendHeadroom';
import { resolveApiCaller } from '$lib/server/brainApi/resolveApiCaller';
import { cheapestModelId } from '$lib/data/modelLadder';
import { longestQuestion } from '$lib/data/questionLimits';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { RequestHandler } from './$types';

export const config = { maxDuration: 300 };

export const POST: RequestHandler = async ({ request, params }) => {
	const { supabase, brain, tokenHash } = await resolveApiCaller(request, params.brainId);

	const payload = await request.json().catch(() => ({}));
	const question = readQuestion(payload);
	await requireSpendHeadroom(supabase, brain.ownerId, apiQuestionReason);
	const spend = await spendForApiQuestion(supabase, tokenHash);
	if (spend === 'insufficient_credits') error(402, 'The brain owner is out of credits');
	if (spend === 'account_restricted') error(403, 'This account is currently restricted');

	try {
		const conversationId = await resolveConversationId(
			supabase,
			brain,
			payload.conversationId
		);
		const priorTurns = await rememberedTurns(supabase, conversationId);
		const contexts = await getBrainContexts(supabase, brain.id);
		const index = await getBrainPageIndex(supabase, brain.id);
		// A bearer call has no session to resolve a slider, so it runs on the
		// cheapest rung and settles usage against the owner (docs/model-pricing.md).
		const answer = await askModeller(
			supabase,
			brain.id,
			contexts,
			index,
			[...priorTurns, { speaker: 'user', text: question }],
			cheapestModelId
		);
		await recordConversationTurn(supabase, conversationId, question, answer, brain.ownerId);
		await recordBrainEvent(supabase, {
			brainId: brain.id,
			kind: 'question_answered',
			detail: {
				question,
				answerMarkdown: answer.answerMarkdown,
				citedSlugs: answer.citedSlugs,
				conversationId,
				askedThrough: 'api'
			}
		});
		const settledBalance = await settleForApiQuestion(brain.ownerId);
		return json({ conversationId, ...answer, creditBalance: settledBalance ?? spend.creditBalance });
	} catch (failure) {
		console.error('Brain API question failed', failure);
		await refundForApiQuestion(brain.ownerId);
		error(502, 'That question failed — the credits have been refunded');
	}
};

function readQuestion(payload: { question?: unknown }): string {
	const question = typeof payload.question === 'string' ? payload.question.trim() : '';
	if (question === '') error(400, 'A question is required');
	return question.slice(0, longestQuestion);
}

async function resolveConversationId(
	supabase: SupabaseClient,
	brain: { id: string; ownerId: string },
	candidate: unknown
): Promise<string> {
	if (typeof candidate === 'string' && candidate !== '') {
		const { data } = await supabase
			.from('brain_conversations')
			.select('id')
			.eq('id', candidate)
			.eq('brain_id', brain.id)
			.maybeSingle();
		if (data !== null) return data.id;
	}
	return createBrainConversation(supabase, brain.id, 'api', brain.ownerId);
}
