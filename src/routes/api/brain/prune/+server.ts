import { error, json } from '@sveltejs/kit';
import { creditsPerBrainPrune } from '$lib/data/creditPricing';
import { getCreditBalance } from '$lib/server/credits/getCreditBalance';
import { getDomainBrain } from '$lib/server/entities/getDomainBrain';
import {
	brainPruneReason,
	refundForBrainPrune,
	spendForBrainPrune
} from '$lib/server/brain/spendForBrainWork';
import { runModelPrune } from '$lib/server/brain/runModelPrune';
import { settleQuestionUsage } from '$lib/server/credits/settleQuestionUsage';
import type { RequestHandler } from './$types';

export const config = { maxDuration: 300 };

export const POST: RequestHandler = async ({ locals, request }) => {
	const { user } = await locals.safeGetSession();
	if (user === null) error(401, 'Sign in to manage your expertise brain');

	const payload = await request.json();
	const brain = await getDomainBrain(locals.supabase, readBrainId(payload));
	if (brain === null) error(404, 'That expertise brain could not be found');
	if (brain.ownerId !== user.id) error(403, 'Only the owner can prune the model');

	const spend = await spendForBrainPrune(locals.supabase);
	if (spend === 'insufficient_credits') error(402, 'You are out of credits');
	if (spend === 'account_restricted') error(403, 'This account is currently restricted');

	try {
		const outcome = await runModelPrune(locals.supabase, brain.id);
		const settledBalance = await settleQuestionUsage(user.id, creditsPerBrainPrune, brainPruneReason);
		return json({
			...outcome,
			creditBalance: settledBalance ?? (await getCreditBalance(locals.supabase))
		});
	} catch (failure) {
		console.error('Brain prune failed', failure);
		await refundForBrainPrune(user.id);
		error(502, 'Pruning failed — your credits have been refunded');
	}
};

function readBrainId(payload: unknown): string {
	const brainId = (payload as { brainId?: unknown }).brainId;
	if (typeof brainId !== 'string' || brainId === '') error(400, 'Say which brain to prune');
	return brainId;
}
