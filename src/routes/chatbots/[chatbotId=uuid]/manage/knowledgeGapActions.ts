import { fail } from '@sveltejs/kit';
import { dismissKnowledgeGap } from '$lib/server/chatbots/dismissKnowledgeGap';
import { findOpenKnowledgeGap } from '$lib/server/chatbots/findOpenKnowledgeGap';
import { requireOwnedChatbot } from '$lib/server/chatbots/requireOwnedChatbot';
import { requireUser } from '$lib/server/auth/requireUser';
import { teachChatbotAnswer, type TeachingOutcome } from '$lib/server/chatbots/teachChatbotAnswer';
import { longestTeachingAnswer } from '$lib/data/chatbotTypes';
import type { RequestEvent } from './$types';

const teachingRefusals: Record<Exclude<TeachingOutcome, 'taught'>, { status: number; message: string }> = {
	no_expertise_brain: {
		status: 409,
		message: 'This knowledge base has no expertise brain to teach yet.'
	},
	insufficient_credits: {
		status: 402,
		message: 'You are out of credits — teaching costs the same as reading a document.'
	},
	account_restricted: { status: 403, message: 'Your account is currently restricted.' },
	reading_failed: {
		status: 502,
		message: 'Reading your answer into the brain failed — your credits have been refunded.'
	}
};

export async function answerQuestion({ locals, params, request }: RequestEvent) {
	const user = await requireUser(locals);
	const chatbot = await requireOwnedChatbot(locals.supabase, params.chatbotId, user.id);
	const formData = await request.formData();
	const answer = String(formData.get('answer') ?? '').trim().slice(0, longestTeachingAnswer);
	if (answer === '') return fail(400, { message: 'Write the answer first.' });
	const gap = await findOpenKnowledgeGap(locals.supabase, chatbot.id, gapIdFrom(formData));
	if (gap === null) return fail(404, { message: 'That question is no longer open.' });
	const outcome = await teachChatbotAnswer(locals.supabase, user.id, chatbot, gap, answer);
	if (outcome === 'taught') return;
	const refusal = teachingRefusals[outcome];
	return fail(refusal.status, { message: refusal.message });
}

export async function dismissQuestion({ locals, params, request }: RequestEvent) {
	const user = await requireUser(locals);
	const chatbot = await requireOwnedChatbot(locals.supabase, params.chatbotId, user.id);
	const formData = await request.formData();
	await dismissKnowledgeGap(locals.supabase, chatbot.id, gapIdFrom(formData));
}

function gapIdFrom(formData: FormData): string {
	return String(formData.get('gapId') ?? '');
}
