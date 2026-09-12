import { error, json } from '@sveltejs/kit';
import { creditsPerBrainUnlearn } from '$lib/data/creditPricing';
import { deleteBrainSource } from '$lib/server/brain/deleteBrainSource';
import { findBrainSource } from '$lib/server/brain/findBrainSource';
import { getCreditBalance } from '$lib/server/credits/getCreditBalance';
import { runSourceRemoval } from '$lib/server/brain/runSourceRemoval';
import {
	brainUnlearnReason,
	refundForBrainUnlearn,
	spendForBrainUnlearn
} from '$lib/server/brain/spendForBrainWork';
import { settleQuestionUsage } from '$lib/server/credits/settleQuestionUsage';
import type { RequestHandler } from './$types';

export const config = { maxDuration: 300 };

export const DELETE: RequestHandler = async ({ locals, params }) => {
	const { user } = await locals.safeGetSession();
	if (user === null) error(401, 'Sign in to manage your expertise brain');

	const source = await findBrainSource(locals.supabase, params.sourceId);
	if (source === null) error(404, 'That document could not be found');

	if (source.status !== 'ingested') {
		await deleteBrainSource(locals.supabase, source);
		return json({ creditBalance: await getCreditBalance(locals.supabase) });
	}

	const spend = await spendForBrainUnlearn(locals.supabase, source.id);
	if (spend === 'insufficient_credits') error(402, 'You are out of credits');
	if (spend === 'account_restricted') error(403, 'This account is currently restricted');

	try {
		await runSourceRemoval(locals.supabase, source);
	} catch (failure) {
		console.error('Brain unlearn failed', failure);
		await refundForBrainUnlearn(user.id);
		error(502, 'Unlearning that document failed — your credits have been refunded');
	}
	const settledBalance = await settleQuestionUsage(user.id, creditsPerBrainUnlearn, brainUnlearnReason);
	return json({ creditBalance: settledBalance ?? (await getCreditBalance(locals.supabase)) });
};
