import { error, json } from '@sveltejs/kit';
import { converseWithFace } from '$lib/server/brain/converseWithFace';
import { createBrainConversation } from '$lib/server/brain/createBrainConversation';
import { getBrainContexts } from '$lib/server/brain/getBrainContexts';
import { getBrainPageIndex } from '$lib/server/brain/getBrainPageIndex';
import { getLatestConversationId } from '$lib/server/brain/getBrainConversation';
import { getLatestDomainBrain } from '$lib/server/entities/getDomainBrain';
import { recordBrainEvent } from '$lib/server/brain/recordBrainEvent';
import { recordConversationTurn } from '$lib/server/brain/recordConversationTurn';
import { questionFloorCreditsFor } from '$lib/data/creditPricing';
import { refundQuestionUsage } from '$lib/server/credits/refundQuestionUsage';
import { resolveRequestModel } from '$lib/server/anthropic/resolveRequestModel';
import { settleQuestionUsage } from '$lib/server/credits/settleQuestionUsage';
import { spendCredits } from '$lib/server/credits/spendCredits';
import type { FaceChatReply, FaceChatTurn } from '$lib/data/faceChatTypes';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { RequestEvent, RequestHandler } from './$types';

const longestConversation = 12;
const longestTurnLength = 2000;
const faceSpendReason = 'brain_question';

export const config = { maxDuration: 300 };

export const POST: RequestHandler = async (event) => {
	error(404, 'The face is not open yet');
	return answerFaceChat(event);
};

async function answerFaceChat({ locals, request }: RequestEvent): Promise<Response> {
	const { user } = await locals.safeGetSession();
	if (user === null) error(401, 'Sign in to talk to your expertise brain');

	const turns = await readTurns(request);
	const brain = await getLatestDomainBrain(locals.supabase);
	if (brain === null) error(404, 'Create an expertise brain in your knowledge base first');
	const reserve = questionFloorCreditsFor(await resolveRequestModel());
	const spend = await spendCredits(locals.supabase, reserve, faceSpendReason);
	if (spend === 'insufficient_credits') error(402, 'You are out of credits');
	if (spend === 'account_restricted') error(403, 'This account is currently restricted');

	try {
		const spoken = await speakWithFace(locals.supabase, brain.id, turns);
		const settledBalance = await settleQuestionUsage(user.id, reserve, faceSpendReason);
		return json({ ...spoken, creditBalance: settledBalance ?? spend.creditBalance });
	} catch (failure) {
		console.error('Face chat failed', failure);
		await refundQuestionUsage(user.id, reserve, faceSpendReason);
		error(502, 'That reply failed — your credits have been refunded');
	}
}

async function speakWithFace(
	supabase: SupabaseClient,
	brainId: string,
	turns: FaceChatTurn[]
): Promise<FaceChatReply> {
	const contexts = await getBrainContexts(supabase, brainId);
	const index = await getBrainPageIndex(supabase, brainId);
	const spoken = await converseWithFace(supabase, brainId, contexts, index, turns);
	const question = turns[turns.length - 1].text;
	const conversationId = await faceConversationId(supabase, brainId);
	await recordConversationTurn(supabase, conversationId, question, {
		answerMarkdown: spoken.reply,
		citedSlugs: spoken.citedSlugs
	});
	await recordBrainEvent(supabase, {
		brainId,
		kind: 'question_answered',
		detail: {
			question,
			answerMarkdown: spoken.reply,
			citedSlugs: spoken.citedSlugs,
			conversationId,
			askedThrough: 'face'
		}
	});
	return spoken;
}

async function faceConversationId(supabase: SupabaseClient, brainId: string): Promise<string> {
	const existingId = await getLatestConversationId(supabase, brainId, 'face');
	return existingId ?? createBrainConversation(supabase, brainId, 'face');
}

async function readTurns(request: Request): Promise<FaceChatTurn[]> {
	const payload = await request.json();
	const turns = Array.isArray(payload.turns) ? payload.turns.map(asTurn) : [];
	if (turns.length === 0) error(400, 'A conversation with at least one message is required');
	if (turns[turns.length - 1].speaker !== 'user') error(400, 'The last message must be yours');
	return turns.slice(-longestConversation);
}

function asTurn(candidate: unknown): FaceChatTurn {
	const turn = candidate as { speaker?: unknown; text?: unknown };
	const speaker = turn.speaker === 'face' ? 'face' : 'user';
	const text = typeof turn.text === 'string' ? turn.text.trim() : '';
	if (text === '') error(400, 'Every message needs some text');
	return { speaker, text: text.slice(0, longestTurnLength) };
}
