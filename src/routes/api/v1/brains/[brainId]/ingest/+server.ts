import { error, json } from '@sveltejs/kit';
import { ingestSentData } from '$lib/server/brain/sentData/ingestSentData';
import { readSentData } from '$lib/server/brain/sentData/sentDataRules';
import { resolveApiCaller } from '$lib/server/brainApi/resolveApiCaller';
import type { RequestHandler } from './$types';

export const config = { maxDuration: 300 };

const badRequest = 400;
const paymentRequired = 402;
const forbidden = 403;
const badGateway = 502;

export const POST: RequestHandler = async ({ request, params }) => {
	const { supabase, brain } = await resolveApiCaller(request, params.brainId);
	const payload = await request.json().catch(() => ({}));
	const sent = readSentData(payload.title, payload.text);
	const outcome = await ingestSentData(supabase, brain, sent, 'api');
	if (outcome.status === 'rejected') error(badRequest, outcome.message);
	if (outcome.status === 'out_of_credits') error(paymentRequired, 'The brain owner is out of credits');
	if (outcome.status === 'account_restricted') error(forbidden, 'This account is currently restricted');
	if (outcome.status === 'failed') error(badGateway, outcome.message);
	return json(outcome);
};
