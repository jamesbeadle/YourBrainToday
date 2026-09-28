import { json } from '@sveltejs/kit';
import { describeReading } from '$lib/server/knowledge/reading/describeReading';
import { readKnowledgeBase } from '$lib/server/knowledge/reading/readKnowledgeBase';
import { readKnowledgeKinds } from '$lib/server/brainApi/readKnowledgeKinds';
import { renderKnowledgeBase } from '$lib/server/knowledge/reading/renderKnowledgeBase';
import { resolveKnowledgeBaseApiCaller } from '$lib/server/brainApi/resolveKnowledgeBaseApiCaller';
import type { RequestHandler } from './$types';

// The front door of one knowledge base's API: its four brains as an agent
// reads them — structured, and as the markdown the orchestrator itself is
// shown — so the agent can reason over the knowledge before it asks.
export const GET: RequestHandler = async ({ request, params, url }) => {
	const { supabase, knowledgeBase } = await resolveKnowledgeBaseApiCaller(request, params.knowledgeBaseId);
	const kinds = readKnowledgeKinds(url.searchParams.get('brains'));
	const reading = await readKnowledgeBase(supabase, knowledgeBase.id, kinds);
	return json({
		knowledgeBase: {
			id: knowledgeBase.id,
			name: knowledgeBase.name,
			description: knowledgeBase.description
		},
		brains: describeReading(reading),
		expertise: reading.expertise,
		experience: reading.experience,
		processMaps: reading.processMaps,
		people: reading.people,
		readingMarkdown: renderKnowledgeBase(reading)
	});
};
