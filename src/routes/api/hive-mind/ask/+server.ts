import { error, json } from '@sveltejs/kit';
import { askHiveMind } from '$lib/server/hive/askHiveMind';
import {
	chargeForDepth,
	noDepthCharge,
	refundDepthCharge,
	type DepthCharge
} from '$lib/server/hive/chargeForDepth';
import { contributorsFrom } from '$lib/server/hive/contributorsFrom';
import { getHiveMembers } from '$lib/server/hive/getHiveMembers';
import { getHiveModelIndex } from '$lib/server/hive/getHiveModelIndex';
import { recordHiveMindQuestion } from '$lib/server/hive/recordHiveMindQuestion';
import {
	hiveMindQuestionReason,
	spendForHiveMindQuestion
} from '$lib/server/hive/spendForHiveMindQuestion';
import { refundQuestionUsage } from '$lib/server/credits/refundQuestionUsage';
import { spendCredits } from '$lib/server/credits/spendCredits';
import { splitHiveMindEarnings } from '$lib/server/hive/splitHiveMindEarnings';
import { creditsPerTradeTalkQuestion, questionFloorCreditsFor } from '$lib/data/creditPricing';
import { resolveRequestModel } from '$lib/server/anthropic/resolveRequestModel';
import { settleQuestionUsage } from '$lib/server/credits/settleQuestionUsage';
import type { RequestEvent, RequestHandler } from './$types';

export const config = { maxDuration: 300 };

export const POST: RequestHandler = async (event) => {
	error(404, 'The Hive Mind is not open yet');
	return answerHiveMindQuestion(event);
};

async function answerHiveMindQuestion({ locals, request }: RequestEvent): Promise<Response> {
	const { user } = await locals.safeGetSession();
	if (user === null) error(401, 'Sign in to ask the Hive Mind');

	const payload = await request.json();
	const question = readQuestion(payload);
	const members = await getHiveMembers(locals.supabase);
	if (members.length === 0) error(409, 'The hive has no specialists yet');
	const spend = await spendForHiveMindQuestion(locals.supabase);
	if (spend === 'insufficient_credits') error(402, 'You are out of credits');
	if (spend === 'account_restricted') error(403, 'This account is currently restricted');
	const reserve = await reserveModelFloor(locals, user.id);
	let depthCharge: DepthCharge = noDepthCharge;

	try {
		const specialists = await getHiveModelIndex(locals.supabase, members);
		const consultation = await askHiveMind(locals.supabase, specialists, question);
		const shares = splitHiveMindEarnings(consultation.pagesReadCounts);
		depthCharge = await chargeForDepth(locals.supabase, consultation.pagesReadCounts);
		await recordHiveMindQuestion(
			locals.supabase,
			question,
			consultation.answerMarkdown,
			consultation.citedPageKeys,
			shares
		);
		const usageBalance = await settleQuestionUsage(user.id, reserve, hiveMindQuestionReason);
		return json({
			answerMarkdown: consultation.answerMarkdown,
			contributors: contributorsFrom(members, shares),
			creditBalance: usageBalance ?? depthCharge.creditBalance ?? spend.creditBalance
		});
	} catch (failure) {
		console.error('Hive Mind question failed', failure);
		await refundQuestionUsage(user.id, reserve, hiveMindQuestionReason);
		await refundDepthCharge(user.id, depthCharge);
		error(502, 'That question failed — your credits have been refunded');
	}
}

// spend_for_hive_mind_question takes the fixed 25 (12 of it the specialists'
// pool); a dearer model tops the reserve up to its floor under the same reason.
// A refused top-up hands the fixed spend back before the request is turned away.
async function reserveModelFloor(locals: App.Locals, payerId: string): Promise<number> {
	const floor = questionFloorCreditsFor(await resolveRequestModel());
	const topUp = floor - creditsPerTradeTalkQuestion;
	if (topUp <= 0) return creditsPerTradeTalkQuestion;
	const spend = await spendCredits(locals.supabase, topUp, hiveMindQuestionReason);
	if (typeof spend !== 'string') return floor;
	await refundQuestionUsage(payerId, creditsPerTradeTalkQuestion, hiveMindQuestionReason);
	if (spend === 'insufficient_credits') error(402, 'You are out of credits');
	error(403, 'This account is currently restricted');
}

function readQuestion(payload: { question?: unknown }): string {
	const question = typeof payload.question === 'string' ? payload.question.trim() : '';
	if (question === '') error(400, 'A question is required');
	return question;
}
