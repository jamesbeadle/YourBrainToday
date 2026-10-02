import { runReadingExchange } from './readingExchange';
import { searchKnowledgeTool } from './searchKnowledgeTool';
import { readPagesTool } from '$lib/server/brain/modellerAnswerTools';
import type { KnowledgeBaseReading } from './readKnowledgeBase';
import type { ReadingExchange, ReadingOutcome } from './readingTypes';
import type { SupabaseClient } from '@supabase/supabase-js';

export type { ReadingExchange, ReadingOutcome } from './readingTypes';

/**
 * Search, read, then answer. The model has three tools: search_knowledge
 * for words the index does not name, read_pages for the expertise pages it
 * needs, and the caller's answer tool. It may take up to mostReadingRounds
 * rounds of searching and reading before the answer is forced. The outcome
 * carries every page key that was truly fetched, so citations can be checked.
 */
export async function readThenAnswer(
	supabase: SupabaseClient,
	reading: KnowledgeBaseReading,
	exchange: ReadingExchange
): Promise<ReadingOutcome> {
	const tools = [searchKnowledgeTool, readPagesTool, exchange.answerTool];
	return runReadingExchange(supabase, reading, exchange, tools);
}
