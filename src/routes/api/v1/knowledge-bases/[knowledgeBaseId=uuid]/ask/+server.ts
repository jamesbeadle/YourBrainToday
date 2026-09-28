import { error, json } from '@sveltejs/kit';
import { askKnowledgeBaseAndSettle } from '$lib/server/orchestrator/askKnowledgeBaseAndSettle';
import { readKnowledgeKinds } from '$lib/server/brainApi/readKnowledgeKinds';
import { resolveKnowledgeBaseApiCaller } from '$lib/server/brainApi/resolveKnowledgeBaseApiCaller';
import type { RequestHandler } from './$types';

export const config = { maxDuration: 300 };

const badRequest = 400;
const paymentRequired = 402;
const forbidden = 403;
const badGateway = 502;

// One question to the orchestrator: {"question": "...", "brains": ["process"]?}
// answers from the named brains, or all four. The owner pays as for a
// question on the site; a failed answer refunds them.
export const POST: RequestHandler = async ({ request, params }) => {
	const { supabase, knowledgeBase } = await resolveKnowledgeBaseApiCaller(request, params.knowledgeBaseId);
	const payload = await request.json().catch(() => ({}));
	const question = typeof payload.question === 'string' ? payload.question : '';
	const kinds = readKnowledgeKinds(payload.brains);
	const outcome = await askKnowledgeBaseAndSettle(supabase, knowledgeBase, question, kinds, 'api');
	if (outcome.status === 'rejected') error(badRequest, outcome.message);
	if (outcome.status === 'out_of_credits') error(paymentRequired, 'The knowledge base owner is out of credits');
	if (outcome.status === 'account_restricted') error(forbidden, 'This account is currently restricted');
	if (outcome.status === 'failed') error(badGateway, outcome.message);
	return json({ ...outcome.answer, creditBalance: outcome.creditBalance });
};
