import { orchestratorAnswerTool } from './orchestratorAnswerTool';
import { orchestratorPrompt } from './orchestratorPrompt';
import { parseOrchestratedAnswer, type OrchestratedAnswer } from './parseOrchestratedAnswer';
import { readKnowledgeBase } from '$lib/server/knowledge/reading/readKnowledgeBase';
import { readThenAnswer } from '$lib/server/knowledge/reading/readThenAnswer';
import { renderKnowledgeBase } from '$lib/server/knowledge/reading/renderKnowledgeBase';
import { everyKnowledgeKind, type KnowledgeKind } from '$lib/data/knowledge/knowledgeKinds';
import type { SupabaseClient } from '@supabase/supabase-js';

export type KnowledgeBaseAsk = {
	knowledgeBase: { id: string; name: string };
	question: string;
	kinds?: KnowledgeKind[];
	model?: string;
};

/**
 * The orchestrator: one question put to a knowledge base, answered from
 * whichever of its brains hold the answer. Reads the brains asked for (all
 * four unless narrowed), shows the model the expertise index and the other
 * brains in full, lets it read the expertise pages it needs once, and
 * returns the answer with its page citations and the brains it drew on.
 */
export async function askKnowledgeBase(
	supabase: SupabaseClient,
	ask: KnowledgeBaseAsk
): Promise<OrchestratedAnswer> {
	const kinds = ask.kinds ?? everyKnowledgeKind;
	const reading = await readKnowledgeBase(supabase, ask.knowledgeBase.id, kinds);
	const system = `${orchestratorPrompt(ask.knowledgeBase.name, kinds)}\n\n# The knowledge base\n\n${renderKnowledgeBase(reading)}`;
	const answerCall = await readThenAnswer(supabase, reading, {
		system,
		messages: [{ role: 'user', content: ask.question }],
		answerTool: orchestratorAnswerTool,
		model: ask.model
	});
	return parseOrchestratedAnswer(answerCall?.input, kinds);
}
