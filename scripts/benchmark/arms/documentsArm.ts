import { loadKnowledgeBaseDocuments } from './loadKnowledgeBaseDocuments';
import { benchmarkAnswerTool, maxBenchmarkAnswerTokens, parseBenchmarkAnswer } from '../benchmarkAnswerTool';
import { requestToolCall } from '$lib/server/anthropic/requestToolCall';
import type { Arm } from '../benchmarkTypes';
import type { SupabaseClient } from '@supabase/supabase-js';

const documentsPrompt =
	'Answer from these documents only; cite the filenames you drew on. Where the documents are ' +
	'silent, say so plainly rather than drawing on general knowledge. Reply only through the answer tool.';

/** A clean model, the raw source documents in one message, and the question. */
export async function documentsArm(
	supabase: SupabaseClient,
	knowledgeBaseId: string,
	model: string,
	budgetCharacters: number
): Promise<Arm> {
	const bundle = await loadKnowledgeBaseDocuments(supabase, knowledgeBaseId, budgetCharacters);
	const setupNote = [
		`${bundle.filenames.length} document(s), ${bundle.contextCharacters.toLocaleString('en-GB')} characters: ${bundle.filenames.join(', ')}.`,
		bundle.budgetNote
	]
		.filter((line) => line !== '')
		.join(' ');
	return {
		name: 'documents',
		setupNote,
		answer: async (question) => {
			const call = await requestToolCall(
				{
					system: documentsPrompt,
					messages: [{ role: 'user', content: [...bundle.contentBlocks, { type: 'text', text: question }] }],
					tools: [benchmarkAnswerTool],
					maxTokens: maxBenchmarkAnswerTokens,
					model
				},
				benchmarkAnswerTool.name
			).catch(answerlessCall);
			return { ...parseBenchmarkAnswer(call), pagesRead: [], contextCharacters: bundle.contextCharacters };
		}
	};
}

function answerlessCall(failure: unknown): undefined {
	console.error('The documents arm got no answer', failure);
	return undefined;
}
