import { error, json } from '@sveltejs/kit';
import { findBrainSource } from '$lib/server/brain/findBrainSource';
import { getCreditBalance } from '$lib/server/credits/getCreditBalance';
import { getDomainBrain } from '$lib/server/entities/getDomainBrain';
import { ingestCreditsFor } from '$lib/data/creditPricing';
import { refundQuestionUsage } from '$lib/server/credits/refundQuestionUsage';
import { runSourceIngest } from '$lib/server/brain/runSourceIngest';
import { settleQuestionUsage } from '$lib/server/credits/settleQuestionUsage';
import { spendCredits } from '$lib/server/credits/spendCredits';
import type { RequestHandler } from './$types';

export const config = { maxDuration: 300 };

const ingestSpendReason = 'brain_ingest_sized';

export const POST: RequestHandler = async ({ locals, params }) => {
	const { user } = await locals.safeGetSession();
	if (user === null) error(401, 'Sign in to manage your expertise brain');

	const source = await findBrainSource(locals.supabase, params.sourceId);
	if (source === null) error(404, 'That document could not be found');
	if (source.status !== 'ingested') error(409, 'Only documents already in the brain can be re-read');

	const brain = await getDomainBrain(locals.supabase, source.brainId);
	if (brain === null) error(404, 'That expertise brain no longer exists');
	if (brain.ownerId !== user.id) error(403, 'Only the owner can re-read a document');

	const reserve = ingestCreditsFor(source.byteCount);
	const spend = await spendCredits(locals.supabase, reserve, ingestSpendReason);
	if (spend === 'insufficient_credits') error(402, 'You are out of credits');
	if (spend === 'account_restricted') error(403, 'This account is currently restricted');

	try {
		await runSourceIngest(locals.supabase, source);
	} catch (failure) {
		console.error('Brain re-read failed', failure);
		await refundQuestionUsage(user.id, reserve, ingestSpendReason);
		error(502, 'Re-reading that document failed — your credits have been refunded');
	}
	const settledBalance = await settleQuestionUsage(user.id, reserve, ingestSpendReason);
	return json({ creditBalance: settledBalance ?? (await getCreditBalance(locals.supabase)) });
};
