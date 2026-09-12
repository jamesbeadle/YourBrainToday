import { parseBrainAnswer } from '../brain/parseBrainAnswer';
import type { ChatbotAnswer } from '$lib/data/chatbotTypes';

type AnswerInput = { isKnowledgeGap?: unknown; missingKnowledge?: unknown };

const longestMissingKnowledge = 400;

export function parseChatbotAnswer(input: unknown, question: string): ChatbotAnswer {
	const answer = parseBrainAnswer(input);
	return {
		answerMarkdown: answer.answerMarkdown,
		citedPageKeys: answer.citedSlugs,
		missingKnowledge: missingKnowledgeFrom(input, question)
	};
}

// The bot's yes/no decides whether there is a gap; its wording of the gap is
// welcome but optional — the member's own question stands in when it is blank.
function missingKnowledgeFrom(input: unknown, question: string): string | null {
	if (typeof input !== 'object' || input === null) return null;
	const candidate = input as AnswerInput;
	if (candidate.isKnowledgeGap !== true) return null;
	const stated =
		typeof candidate.missingKnowledge === 'string' ? candidate.missingKnowledge.trim() : '';
	return (stated === '' ? question : stated).slice(0, longestMissingKnowledge);
}
