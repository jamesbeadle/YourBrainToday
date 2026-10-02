import { error, json } from '@sveltejs/kit';
import { claimSourceReading } from '$lib/server/brain/reading/claimSourceReading';
import { findBrainSource, type StoredBrainSource } from '$lib/server/brain/findBrainSource';
import { getDomainBrain } from '$lib/server/entities/getDomainBrain';
import { readingStateFor } from '$lib/server/brain/reading/readingState';
import { runReadingStage, type ReadingContext } from '$lib/server/brain/reading/runReadingStage';
import { slowDownMessage } from '$lib/server/credits/requireSpendHeadroom';
import type { RequestHandler } from './$types';

export const config = { maxDuration: 300 };

/**
 * One stage of reading a source, per request. A source that is waiting,
 * failed or already in the brain is claimed and begun; one that is reading
 * has its current stage run. The reply says where the reading now stands,
 * so the caller asks again until it is in the brain, proposed or failed.
 */
export const POST: RequestHandler = async ({ locals, params }) => {
	const { user } = await locals.safeGetSession();
	if (user === null) error(401, 'Sign in to build your expertise brain');
	const source = await findBrainSource(locals.supabase, params.sourceId);
	if (source === null) error(404, 'That document could not be found');
	const brain = await getDomainBrain(locals.supabase, source.brainId);
	if (brain === null) error(404, 'That expertise brain no longer exists');
	const isProposal = brain.ownerId !== user.id;
	const context: ReadingContext = {
		brain,
		payer: { payerId: user.id, reason: 'brain_ingest_sized' },
		proposer: isProposal ? { email: user.email ?? '' } : null
	};
	const reading = source.status === 'reading' ? source : await begin(locals.supabase, source, context);
	const step = await runReadingStage(locals.supabase, reading, context);
	const state = await readingStateFor(locals.supabase, source.id);
	return json({ ...state, step });
};

async function begin(
	supabase: App.Locals['supabase'],
	source: StoredBrainSource,
	context: ReadingContext
): Promise<StoredBrainSource> {
	if (source.status === 'ingested' && context.proposer !== null) {
		error(403, 'Only the owner can re-read a document');
	}
	const claim = await claimSourceReading(supabase, source, context.payer);
	if (claim.status === 'claimed') return claim.source;
	if (claim.status === 'out_of_credits') error(402, 'You are out of credits');
	if (claim.status === 'account_restricted') error(403, 'This account is currently restricted');
	if (claim.status === 'rate_limited') error(429, slowDownMessage);
	error(409, 'That document is being read already');
}
