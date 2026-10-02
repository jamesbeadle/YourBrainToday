import { benchmarkAnswerTool, parseBenchmarkAnswer } from '../benchmarkAnswerTool';
import { describeReadingAsLines } from '$lib/server/knowledge/reading/describeReading';
import { readKnowledgeBase } from '$lib/server/knowledge/reading/readKnowledgeBase';
import { readThenAnswer } from '$lib/server/knowledge/reading/readThenAnswer';
import { renderKnowledgeBase } from '$lib/server/knowledge/reading/renderKnowledgeBase';
import type { Arm } from '../benchmarkTypes';
import type { KnowledgeBase } from '$lib/server/knowledge/getKnowledgeBase';
import type { SupabaseClient } from '@supabase/supabase-js';

const selfOrchestrationPrompt = (knowledgeBaseName: string) =>
	`You are answering questions about "${knowledgeBaseName}" from its four brains, shown below exactly as ` +
	'a connected Claude reads them over MCP. Search with search_knowledge when the index does not name ' +
	'what you need, read expertise pages with read_pages, and reply only through the answer tool. ' +
	'Assert only what the brains state; where they are silent, say so. Cite the page keys you read.';

/**
 * The self-orchestration path: a clean model given the free MCP reads — the
 * description, the expertise index, the experience, the process map and the
 * people — plus the search and read tools, with no orchestrator prompt.
 */
export async function brainsSelfArm(supabase: SupabaseClient, knowledgeBase: KnowledgeBase, model: string): Promise<Arm> {
	const reading = await readKnowledgeBase(supabase, knowledgeBase.id);
	const system = [
		selfOrchestrationPrompt(knowledgeBase.name),
		`# The brains\n\n${describeReadingAsLines(reading)}`,
		`# The knowledge base\n\n${renderKnowledgeBase(reading)}`
	].join('\n\n');
	return {
		name: 'brains-self',
		setupNote: `The free reads render to ${system.length.toLocaleString('en-GB')} characters before any page is read.`,
		answer: async (question) => {
			const outcome = await readThenAnswer(supabase, reading, {
				system,
				messages: [{ role: 'user', content: question }],
				answerTool: benchmarkAnswerTool,
				model
			});
			return {
				...parseBenchmarkAnswer(outcome.answerCall?.input),
				pagesRead: outcome.pagesRead,
				contextCharacters: system.length
			};
		}
	};
}
