import { error, json } from '@sveltejs/kit';
import { converseWithAgent } from '$lib/server/agent/converseWithAgent';
import { creditsPerReply, harvestCreditsFor, questionFloorCreditsFor } from '$lib/data/creditPricing';
import { refundQuestionUsage } from '$lib/server/credits/refundQuestionUsage';
import { requireSpendHeadroom } from '$lib/server/credits/requireSpendHeadroom';
import { resolveRequestModel } from '$lib/server/anthropic/resolveRequestModel';
import { settleQuestionUsage } from '$lib/server/credits/settleQuestionUsage';
import { spendCredits } from '$lib/server/credits/spendCredits';
import { getWorkflow } from '$lib/server/entities/getWorkflow';
import { spendForAgentReply } from '$lib/server/agent/spendForAgentReply';
import type { RequestHandler } from './$types';

export const config = { maxDuration: 300 };

const replySpendReason = 'agent_reply';

export const POST: RequestHandler = async ({ locals, request }) => {
	const { user } = await locals.safeGetSession();
	if (user === null) error(401, 'Sign in to talk to the agent');

	const { sessionId, workflowId, message } = await readChatRequest(request);
	const workflow = await getWorkflow(locals.supabase, workflowId);
	if (workflow === null) error(404, 'That workflow could not be found');
	await requireSpendHeadroom(locals.supabase, user.id);
	const spend = await spendForAgentReply(locals.supabase, sessionId);
	if (spend === 'insufficient_credits') error(402, 'You are out of credits');
	if (spend === 'account_restricted') error(403, 'This account is currently restricted');
	const reserve = await reserveModelFloor(locals, user.id);

	try {
		const agentTurn = await converseWithAgent(locals.supabase, user.id, sessionId, workflow, message);
		await chargeForHarvest(locals, agentTurn.harvest);
		const usageBalance = await settleQuestionUsage(user.id, reserve, replySpendReason);
		return json({
			reply: agentTurn.reply,
			map: agentTurn.map,
			creditBalance: usageBalance ?? spend.creditBalance
		});
	} catch (failure) {
		console.error('Agent reply failed', failure);
		await refundQuestionUsage(user.id, reserve, replySpendReason);
		error(502, 'That reply failed — your credits have been refunded');
	}
};

// spend_for_agent_reply takes the fixed 10; a dearer model tops the reserve
// up to its floor under the same reason, so settlement measures from the floor.
// A refused top-up hands the fixed spend back before the request is turned away.
async function reserveModelFloor(locals: App.Locals, payerId: string): Promise<number> {
	const floor = questionFloorCreditsFor(await resolveRequestModel());
	const topUp = floor - creditsPerReply;
	if (topUp <= 0) return creditsPerReply;
	const spend = await spendCredits(locals.supabase, topUp, replySpendReason);
	if (typeof spend !== 'string') return floor;
	await refundQuestionUsage(payerId, creditsPerReply, replySpendReason);
	if (spend === 'insufficient_credits') error(402, 'You are out of credits');
	error(403, 'This account is currently restricted');
}

async function chargeForHarvest(
	locals: App.Locals,
	harvest: { expertiseFacts: string[]; experienceEvents: unknown[] }
): Promise<void> {
	const itemCount = harvest.expertiseFacts.length + harvest.experienceEvents.length;
	const harvestCost = harvestCreditsFor(itemCount);
	if (harvestCost === 0) return;
	await spendCredits(locals.supabase, harvestCost, 'knowledge_harvest').catch(() => undefined);
}

async function readChatRequest(
	request: Request
): Promise<{ sessionId: string; workflowId: string; message: string }> {
	const payload = await request.json();
	const sessionId = typeof payload.sessionId === 'string' ? payload.sessionId : '';
	const workflowId = typeof payload.workflowId === 'string' ? payload.workflowId : '';
	const message = typeof payload.message === 'string' ? payload.message.trim() : '';
	if (sessionId === '' || workflowId === '' || message === '') {
		error(400, 'A session, a workflow, and a message are required');
	}
	return { sessionId, workflowId, message };
}
