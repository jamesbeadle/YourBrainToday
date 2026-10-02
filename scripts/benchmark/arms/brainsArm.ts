import { askKnowledgeBase } from '$lib/server/orchestrator/askKnowledgeBase';
import { readKnowledgeBase } from '$lib/server/knowledge/reading/readKnowledgeBase';
import { renderKnowledgeBase } from '$lib/server/knowledge/reading/renderKnowledgeBase';
import type { Arm } from '../benchmarkTypes';
import type { KnowledgeBase } from '$lib/server/knowledge/getKnowledgeBase';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * The orchestrator as the MCP and API doors run it, with no billing and no
 * record. The context measured is what the orchestrator is shown before it
 * reads: the pages it then fetches are reported as pagesRead.
 */
export async function brainsArm(supabase: SupabaseClient, knowledgeBase: KnowledgeBase, model: string): Promise<Arm> {
	const shownCharacters = renderKnowledgeBase(await readKnowledgeBase(supabase, knowledgeBase.id)).length;
	return {
		name: 'brains',
		setupNote: `The four brains render to ${shownCharacters.toLocaleString('en-GB')} characters before any page is read.`,
		answer: async (question) => {
			const answer = await askKnowledgeBase(supabase, { knowledgeBase, question, model });
			return {
				answerMarkdown: answer.answerMarkdown,
				citedSources: answer.citedPageKeys,
				pagesRead: answer.pagesRead,
				contextCharacters: shownCharacters
			};
		}
	};
}
